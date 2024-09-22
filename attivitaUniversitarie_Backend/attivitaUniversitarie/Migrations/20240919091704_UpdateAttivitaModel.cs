using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace attivitaUniversitarie.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttivitaModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "stato",
                table: "Attivita",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "stato",
                table: "Attivita");
        }
    }
}
