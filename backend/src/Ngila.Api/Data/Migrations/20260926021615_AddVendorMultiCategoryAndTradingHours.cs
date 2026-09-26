using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ngila.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorMultiCategoryAndTradingHours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create the new tables first, then copy each vendor's existing single
            // CategoryId/OpeningTime/ClosingTime into them, *before* dropping those columns -
            // this DB has real (non-seed) vendor rows, so a plain drop would silently lose data.
            migrationBuilder.CreateTable(
                name: "CategoryVendorProfile",
                columns: table => new
                {
                    CategoriesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendorProfilesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoryVendorProfile", x => new { x.CategoriesId, x.VendorProfilesId });
                    table.ForeignKey(
                        name: "FK_CategoryVendorProfile_Categories_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategoryVendorProfile_VendorProfiles_VendorProfilesId",
                        column: x => x.VendorProfilesId,
                        principalTable: "VendorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorTradingHours",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendorProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    IsOpen = table.Column<bool>(type: "bit", nullable: false),
                    OpenTime = table.Column<TimeSpan>(type: "time", nullable: true),
                    CloseTime = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorTradingHours", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorTradingHours_VendorProfiles_VendorProfileId",
                        column: x => x.VendorProfileId,
                        principalTable: "VendorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategoryVendorProfile_VendorProfilesId",
                table: "CategoryVendorProfile",
                column: "VendorProfilesId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorTradingHours_VendorProfileId",
                table: "VendorTradingHours",
                column: "VendorProfileId");

            migrationBuilder.Sql(@"
                INSERT INTO [CategoryVendorProfile] ([CategoriesId], [VendorProfilesId])
                SELECT [CategoryId], [Id] FROM [VendorProfiles] WHERE [CategoryId] IS NOT NULL;
            ");

            // Same opening/closing time every day of the week - the single pair every vendor had
            // before this migration didn't distinguish between days anyway.
            migrationBuilder.Sql(@"
                INSERT INTO [VendorTradingHours] ([Id], [VendorProfileId], [DayOfWeek], [IsOpen], [OpenTime], [CloseTime])
                SELECT NEWID(), [v].[Id], [d].[DayNum], 1, [v].[OpeningTime], [v].[ClosingTime]
                FROM [VendorProfiles] [v]
                CROSS JOIN (VALUES (0),(1),(2),(3),(4),(5),(6)) AS [d]([DayNum])
                WHERE [v].[OpeningTime] IS NOT NULL AND [v].[ClosingTime] IS NOT NULL;
            ");

            migrationBuilder.DropForeignKey(
                name: "FK_VendorProfiles_Categories_CategoryId",
                table: "VendorProfiles");

            migrationBuilder.DropIndex(
                name: "IX_VendorProfiles_CategoryId",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "ClosingTime",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "VendorProfiles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "VendorProfiles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ClosingTime",
                table: "VendorProfiles",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "OpeningTime",
                table: "VendorProfiles",
                type: "time",
                nullable: true);

            // Best-effort restore: picks one category back onto the single column, and Monday's
            // hours back onto the single opening/closing pair - the down migration can't fully
            // reverse "many categories" or "different hours per day" losslessly.
            migrationBuilder.Sql(@"
                UPDATE [v]
                SET [v].[CategoryId] = [c].[CategoriesId]
                FROM [VendorProfiles] [v]
                CROSS APPLY (SELECT TOP (1) [CategoriesId] FROM [CategoryVendorProfile] WHERE [VendorProfilesId] = [v].[Id]) [c];

                UPDATE [v]
                SET [v].[OpeningTime] = [h].[OpenTime], [v].[ClosingTime] = [h].[CloseTime]
                FROM [VendorProfiles] [v]
                CROSS APPLY (SELECT TOP (1) [OpenTime], [CloseTime] FROM [VendorTradingHours] WHERE [VendorProfileId] = [v].[Id] AND [DayOfWeek] = 1) [h];
            ");

            migrationBuilder.DropTable(
                name: "CategoryVendorProfile");

            migrationBuilder.DropTable(
                name: "VendorTradingHours");

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_CategoryId",
                table: "VendorProfiles",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_VendorProfiles_Categories_CategoryId",
                table: "VendorProfiles",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
