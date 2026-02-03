export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
export type AssetType = 'IMAGE' | 'VIDEO'

export interface PostAssetResponse {
  type: AssetType
  url: string
  thumbnailUrl: string | null
}

export interface HomePost {
  externalId: string
  title: string | null
  imageUrl: string | null
  description: string | null
  permalink: string | null
  publishedAt: string | null
  mediaType: MediaType | null
  coverImageUrl: string | null
  assets: PostAssetResponse[] | null
}
