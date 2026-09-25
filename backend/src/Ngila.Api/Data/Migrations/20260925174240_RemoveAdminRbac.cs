using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ngila.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAdminRbac : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminTitle",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdminTitle",
                table: "AspNetUsers",
                type: "int",
                nullable: true);
        }
    }
}
