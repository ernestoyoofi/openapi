# Dokumentasi Penggunaan API

Dokumentasi untuk melakukan request api atau detail untuk melakukan request

## List Module Script

- [Komiku.id](./modules/komiku.js) • 8 Mei 2024
- [BMKG Cuaca & Gempa](./modules/bmkg.js) • 8 Mei 2024
- [Ssstik.io - Tiktok Downloader](./lib/ssstik.js) • 9 Mei 2024

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

> Pada api ini tidak memasang cors, jadi jika kamu membuatnya dalam sebuah situs, maka api ini akan terblokir

```bash
https://openapi.nakiko.vercel.app/
```

# Dokumentasi Setiap Request

### Komiku.id - Rekomendasi

**Path URL**

`[GET] /komiku.id`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| length | `NumberType` | Digunakan untuk melihat hasil selanjutnya atau terusannya |

**Result**

```js
{
  status: Number,
  data: {
    page: Number,
    next: true|false,
    list: [
      {
        image: String,
        title: String,
        desc: String,
        view?: String,
        update?: String,
        slug: String
      },
      ...more
    ]
  }
}
```

### Komiku.id - Pencarian

**Path URL**

`[GET] /komiku.id/search`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| q     | `StringType` (Wajib) | Digunakan untuk mencari spesifik manga yang kamu inginkan |
| length | `NumberType` | Digunakan untuk melihat hasil selanjutnya atau terusannya |

**Result**

```js
{
  status: Number,
  data: {
    page: Number,
    next: true|false,
    list: [
      {
        image: String,
        title: String,
        desc: String,
        update?: String,
        slug: String
      },
      ...more
    ]
  }
}
```

### Komiku.id - Genre

**Path URL**

`[GET] /komiku.id/genre/:slug`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| :slug | `StringType` (Wajib) | Digunakan untuk mencari spesifik manga yang kamu inginkan |
| length | `NumberType` | Digunakan untuk melihat hasil selanjutnya atau terusannya |

**Result**

```js
{
  status: Number,
  data: {
    page: Number,
    next: true|false,
    list: [
      {
        image: String,
        title: String,
        desc: String,
        update?: String,
        slug: String
      },
      ...more
    ]
  }
}
```

### Komiku.id - Detail Manga

**Path URL**

`[GET] /komiku.id/manga/:slug`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| :slug | `StringType` (Wajib) | Melihat halaman detail dari manga tersebut |

**Result**

```js
{
  status: Number,
  data: {
    cover: String,
    title: String,
    subtitle: String,
    category: String,
    storyconcept: String,
    creator: String,
    status?: String,
    synopsis: String,
    genre: String[],
    character: URLString[],
    totalchapter: Number,
    chapter: [
      {
        key: NumberIndex,
        ch: String,
        series_date: String,
        slug: String
      },
      ...more
    ]
  }
}
```

### Komiku.id - Read Manga

**Path URL**

`[GET] /komiku.id/manga/:slug/read`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| :slug | `StringType` (Wajib) | Melihat halaman detail dari manga tersebut |
| next  | `NumberType` | Untuk melihat halaman selanjutnya |

**Result**

```js
{
  status: Number,
  data: {
    title: String,
    subtitle: String,
    chapter: Number,
    islast: true|false,
    image: String[]
  }
}
```

### BMKG - Cuaca Area Only

**Path URL**

`[GET] /bmkg/cuaca/:slug/areaonly`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| :slug | `StringType` (Wajib) | Identifikasi pada spesifik data bmkg |

**Result**

```js
{
  status: Number,
  data: {
    area: [
      {
        name: String,
        areaId: StringNumber,
        coordinate: String
      },
      ...more
    ]
  }
}
```

### BMKG - Info

**Path URL**

`[GET] /bmkg/cuaca/:slug/info`

**Parameter**

| Kunci | Nilai | Deskripsi |
|-------|-------|-----------|
| :slug | `StringType` (Wajib) | Identifikasi pada spesifik data bmkg |

**Result**

```js
{
  status: Number,
  data: {
    report_source: String,
    report_time: Date,
    area: [
      {
        name: String,
        areaId: StringNumber,
        coordinate: String
      },
      ...more
    ],
    area_report: {
      "<AREA ID>": {
        title: String,
        data: [
          {
            kelembapan: String,
            temperatur: String,
            cuaca: String|CuacaLanguage,
            kecepatan_angin: String,
            arah_angin: {
              deg: Number,
              title: String|ArahAnginLanguage,
              waktu: Date,
            }
          },
          ...more
        ]
      },
      ...more
    }
  }
}
```
