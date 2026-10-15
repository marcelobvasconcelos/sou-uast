import { BlockType, ContentStatus, Role } from '@prisma/client';

export interface ImageBlockContent {
  url: string;
  alt: string;
  caption?: string;
  linkUrl?: string;
}

export interface VideoBlockContent {
  url: string;
  title?: string;
  caption?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

export interface GalleryBlockContent {
  images: GalleryItem[];
  columns?: number;
}

export interface RichTextSettings {
  alignment?: 'left' | 'center' | 'right' | 'justify';
  style?: 'default' | 'highlight' | 'callout' | 'quote';
  fontSize?: 'normal' | 'large' | 'small';
}

export interface PageBlockData {
  id?: string;
  type: BlockType;
  order: number;
  content: string; // HTML string para RICH_TEXT e HTML, ou JSON string para IMAGE, VIDEO, GALLERY
  settings?: string | null;
}

export interface MenuItemData {
  id: string;
  title: string;
  url?: string | null;
  pageId?: string | null;
  pageSlug?: string | null;
  categoryId?: string | null;
  parentId?: string | null;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  children?: MenuItemData[];
}

export interface CategoryWithItems {
  id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  menuItems: MenuItemData[];
}

export interface NewsCardData {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage?: string | null;
  isFeatured: boolean;
  status: ContentStatus;
  publishedAt: Date | string;
  viewsCount?: number;
  author?: {
    id: string;
    name: string;
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
