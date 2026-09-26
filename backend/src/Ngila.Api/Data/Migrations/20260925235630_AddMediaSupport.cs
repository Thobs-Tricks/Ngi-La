using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ngila.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeedPostComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeedPostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedPostComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedPostComments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FeedPostComments_FeedPosts_FeedPostId",
                        column: x => x.FeedPostId,
                        principalTable: "FeedPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedPostLikes",
                columns: table => new
                {
                    FeedPostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedPostLikes", x => new { x.FeedPostId, x.UserId });
                    table.ForeignKey(
                        name: "FK_FeedPostLikes_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FeedPostLikes_FeedPosts_FeedPostId",
                        column: x => x.FeedPostId,
                        principalTable: "FeedPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeedPostPhotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeedPostId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedPostPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FeedPostPhotos_FeedPosts_FeedPostId",
                        column: x => x.FeedPostId,
                        principalTable: "FeedPosts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendorProfilePhotos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VendorProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendorProfilePhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendorProfilePhotos_VendorProfiles_VendorProfileId",
                        column: x => x.VendorProfileId,
                        principalTable: "VendorProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeedPostComments_FeedPostId",
                table: "FeedPostComments",
                column: "FeedPostId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedPostComments_UserId",
                table: "FeedPostComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedPostLikes_UserId",
                table: "FeedPostLikes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FeedPostPhotos_FeedPostId",
                table: "FeedPostPhotos",
                column: "FeedPostId");

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfilePhotos_VendorProfileId",
                table: "VendorProfilePhotos",
                column: "VendorProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeedPostComments");

            migrationBuilder.DropTable(
                name: "FeedPostLikes");

            migrationBuilder.DropTable(
                name: "FeedPostPhotos");

            migrationBuilder.DropTable(
                name: "VendorProfilePhotos");
        }
    }
}
