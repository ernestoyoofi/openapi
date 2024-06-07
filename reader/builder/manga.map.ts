interface GenreList {
  label: String,
  slug: String,
}
interface RecommendChapter {
  label: String,
  ch: String,
  update?: String,
}
interface ChapterView {
  key: Number,
  ch: String,
  seris_date: String,
  slug: String,
}
interface CardManga {
  image: String|URL,
  title: String,
  desc: String,
  rate?: String, // Only maid.my.id
  rec?: RecommendChapter | null, // Only maid.my.id
  genre?: GenreList | null, // Only maid.my.id
  view?: String,
  update?: String,
  slug: String
}

interface ListPages {
  page: Number,
  next: Boolean,
  list: CardManga[]
}
interface DetailManga {
  cover: String,
  title: String,
  subtitle?: String, // Only komiku.id
  creator?: String, // Only komiku.id
  category: String,
  storyconcept?: String, // Only komiku.id
  status: String,
  rate?: String, // Only maid.my.id
  synopsis: String,
  genre: GenreList,
  character: String[], // Only komiku.id
  totalchapter: Number
}
interface ReadManga {
  message?: String,
  title: String,
  subtitle?: String, // Only komiku.id
  chapter: Number,
  islast: Boolean,
  image: String[]
}