# Dokumentasi Penggunaan API

Dokumentasi untuk melakukan request api atau detail untuk melakukan request

## List Module Script

- [Komiku.id](./modules/komiku.js) • 8 Mei 2024
- [BMKG Cuaca & Gempa](./modules/bmkg.js) • 8 Mei 2024

## Respon Global

- **notFound**
  - Status: 404
  - Message: Not Found
- **notValid**
  - Status: 402
  - Message: Fulfill the Requirements in the Documentation
  - Fix: Isi parameter atau header atau body request secara lengkap yang kemungkinan hanya tersedia jika itu adalah utama
- **notAccpted**
  - Status: 406
  - Message: Access Limitations For You
- **internalError**
  - Status: 500
  - Message: Internal Server Error

## Origin URL

```bash
https://openapi.ernestoyoofi.vercel.app/
```

## Komiku.id