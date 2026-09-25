using System.Security.Cryptography;
using System.Text;

namespace Ngila.Api.Common;

// AES-GCM encryption for small secrets we need to store and later read back (unlike passwords,
// which are one-way hashed) - the SMTP app password being the only current use. Keyed from a
// SHA-256 of an app-wide secret (Jwt:Secret) rather than ASP.NET Core's DataProtection keyring,
// since DataProtection's keys live on local disk by default and would be lost on every Azure App
// Service redeploy, silently breaking decryption. Jwt:Secret is already a stable, deployed App
// Setting, so tying encryption to it survives redeploys the same way JWT validation already does.
public static class SecretProtector
{
    public static string Encrypt(string plaintext, string keySeed)
    {
        var key = SHA256.HashData(Encoding.UTF8.GetBytes(keySeed));
        var nonce = RandomNumberGenerator.GetBytes(12);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = new byte[plaintextBytes.Length];
        var tag = new byte[16];

        using var aes = new AesGcm(key, tag.Length);
        aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);

        var payload = new byte[nonce.Length + tag.Length + ciphertext.Length];
        Buffer.BlockCopy(nonce, 0, payload, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, payload, nonce.Length, tag.Length);
        Buffer.BlockCopy(ciphertext, 0, payload, nonce.Length + tag.Length, ciphertext.Length);

        return Convert.ToBase64String(payload);
    }

    public static string Decrypt(string encoded, string keySeed)
    {
        var key = SHA256.HashData(Encoding.UTF8.GetBytes(keySeed));
        var payload = Convert.FromBase64String(encoded);

        var nonce = payload[..12];
        var tag = payload[12..28];
        var ciphertext = payload[28..];
        var plaintextBytes = new byte[ciphertext.Length];

        using var aes = new AesGcm(key, tag.Length);
        aes.Decrypt(nonce, ciphertext, tag, plaintextBytes);

        return Encoding.UTF8.GetString(plaintextBytes);
    }
}
