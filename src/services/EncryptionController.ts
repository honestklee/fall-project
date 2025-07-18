import type { MedicalRecord } from "@prisma/client";
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(
  process.env.ENCRYPTION_SECRET || "default_secret",
  "salt",
  32
);
const iv = Buffer.alloc(16, 0);

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export class EncryptionController {
  static encryptMedicalRecord(data: {
    penyakit: string;
    obat: string;
    dokter: string;
    ruangan: string;
  }) {
    return {
      penyakit: encrypt(data.penyakit),
      obat: encrypt(data.obat),
      dokter: encrypt(data.dokter),
      ruangan: encrypt(data.ruangan),
    };
  }

  static decryptMedicalRecord(data: {
    penyakit: string;
    obat: string;
    dokter: string;
    ruangan: string;
  }) {
    return {
      penyakit: data.penyakit ? decrypt(data.penyakit) : "",
      obat: data.obat ? decrypt(data.obat) : "",
      dokter: data.dokter ? decrypt(data.dokter) : "",
      ruangan: data.ruangan ? decrypt(data.ruangan) : "",
    };
  }
}
