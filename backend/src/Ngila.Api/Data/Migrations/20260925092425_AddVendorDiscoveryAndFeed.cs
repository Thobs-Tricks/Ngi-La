using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ngila.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVendorDiscoveryAndFeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "VendorProfiles",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "VendorProfiles",
                type: "decimal(9,6)",
                precision: 9,
                scale: 6,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationDescription",
                table: "VendorProfiles",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "VendorProfiles",
                type: "decimal(10,6)",
                precision: 10,
                scale: 6,
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "OpeningTime",
                table: "VendorProfiles",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "VendorProfiles",
                type: "decimal(3,2)",
                precision: 3,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "ReviewsCount",
                table: "VendorProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FeedPosts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorDisplayRole = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LikesCount = table.Column<int>(type: "int", nullable: false),
                    CommentsCount = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedPosts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedPosts_AspNetUsers_AuthorUserId",
                        column: x => x.AuthorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FeedPosts_VendorProfiles_VendorId",
                        column: x => x.VendorId,
                        principalTable: "VendorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_CategoryId",
                table: "VendorProfiles",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Name",
                table: "Categories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeedPosts_AuthorUserId",
                table: "FeedPosts",
                column: "AuthorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedPosts_CreatedAt",
                table: "FeedPosts",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_FeedPosts_VendorId",
                table: "FeedPosts",
                column: "VendorId");

            migrationBuilder.AddForeignKey(
                name: "FK_VendorProfiles_Categories_CategoryId",
                table: "VendorProfiles",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VendorProfiles_Categories_CategoryId",
                table: "VendorProfiles");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "FeedPosts");

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
                name: "ImageUrl",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "LocationDescription",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "OpeningTime",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "VendorProfiles");

            migrationBuilder.DropColumn(
                name: "ReviewsCount",
                table: "VendorProfiles");
        }
    }
}
