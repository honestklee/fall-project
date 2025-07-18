-- CreateTable
CREATE TABLE "Accident" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tanggalKejadian" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "kronologi" TEXT NOT NULL,
    "sudahDitangani" BOOLEAN NOT NULL,
    "penanganan" TEXT,
    "kondisiPatient" TEXT,
    "hasilPengecekan" TEXT,
    "petugasPencatatId" TEXT NOT NULL,
    "catatanTambahan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accident_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Accident" ADD CONSTRAINT "Accident_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accident" ADD CONSTRAINT "Accident_petugasPencatatId_fkey" FOREIGN KEY ("petugasPencatatId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
