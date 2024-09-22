using System.Text.Json;
using System.Text.Json.Serialization;

public class DateTimeConverter : JsonConverter<DateTime>
{
    private const string DateFormat = "yyyy-MM-ddTHH:mm:ss"; 
    private const string DateFormatWithMilliseconds = "yyyy-MM-ddTHH:mm:ss.fffZ"; 


    /// <summary>
    /// Deserializza una stringa JSON in un oggetto DateTime.
    /// </summary>
    /// <param name="reader">Il lettore JSON.</param>
    /// <param name="typeToConvert">Il tipo da convertire (DateTime).</param>
    /// <param name="options">Opzioni di serializzazione.</param>
    /// <returns>L'oggetto DateTime deserializzato.</returns>
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var dateString = reader.GetString();
            
            if (DateTime.TryParseExact(dateString, DateFormatWithMilliseconds, null, System.Globalization.DateTimeStyles.AdjustToUniversal, out DateTime dateWithMilliseconds))
            {
                return dateWithMilliseconds;
            }

            if (DateTime.TryParseExact(dateString, DateFormat, null, System.Globalization.DateTimeStyles.AssumeUniversal, out DateTime date))
            {
                return date;
            }
        }
         throw new JsonException("Formato data non valido");
    }


    /// <summary>
    /// Serializza un oggetto DateTime in una stringa JSON.
    /// </summary>
    /// <param name="writer">Lo scrittore JSON.</param>
    /// <param name="value">Il valore DateTime da serializzare.</param>
    /// <param name="options">Opzioni di serializzazione.</param>
    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(DateFormat));
    }
}