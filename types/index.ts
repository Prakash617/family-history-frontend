export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string | null;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface Family {
  id: string;
  name: string;
  description: string;
  cover_image?: string | null;
  owner: User;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  members_count: number;
  current_user_role?: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER" | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyDashboardStats {
  total_members: number;
  living_members: number;
  deceased_members: number;
  total_photos: number;
  total_stories: number;
  total_relationships: number;
  recent_activity: Array<{
    type: string;
    title: string;
    timestamp: string;
    id: string;
  }>;
}

export interface PersonBrief {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: string;
  lifespan: string;
  is_living: boolean;
  profile_photo?: string | null;
}

export interface Person {
  id: string;
  family: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  full_name: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  birth_date?: string | null;
  birth_year_approx?: string;
  birth_display: string;
  birth_place?: string;
  death_date?: string | null;
  death_year_approx?: string;
  death_display: string;
  death_place?: string;
  is_living: boolean;
  lifespan: string;
  biography?: string;
  occupation?: string;
  profile_photo?: string | null;
  privacy: "PUBLIC" | "FAMILY_ONLY" | "PRIVATE";
  notes?: string;
  created_at: string;
  updated_at: string;
  relatives?: {
    parents: PersonBrief[];
    spouses: PersonBrief[];
    children: PersonBrief[];
    siblings: PersonBrief[];
  };
}

export interface TreeData {
  meta: {
    familyId: string;
    rootPersonId: string;
    rootPersonName: string;
    totalNodes: number;
    totalEdges: number;
    depth: number;
  };
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      fullName: string;
      gender: string;
      birthDisplay: string;
      deathDisplay: string;
      lifespan: string;
      birthPlace?: string;
      isLiving: boolean;
      occupation?: string;
      photoUrl?: string | null;
      generation: number;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    style?: Record<string, any>;
    data?: Record<string, any>;
  }>;
}

export interface MediaItem {
  id: string;
  family: string;
  uploader: User;
  person?: string | null;
  title: string;
  description: string;
  file: string;
  url: string;
  media_type: "PHOTO" | "DOCUMENT" | "CERTIFICATE" | "OTHER";
  mime_type: string;
  file_size: number;
  captured_date?: string | null;
  visibility: "PUBLIC" | "FAMILY_ONLY" | "PRIVATE";
  created_at: string;
}

export interface Story {
  id: string;
  family: string;
  author: User;
  title: string;
  content: string;
  cover_image?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  associated_people: string[];
  associated_people_details?: PersonBrief[];
  published_at?: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  family: string;
  person?: string | null;
  person_detail?: PersonBrief | null;
  event_type: string;
  title: string;
  date?: string | null;
  date_text?: string;
  place?: string;
  description?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}
