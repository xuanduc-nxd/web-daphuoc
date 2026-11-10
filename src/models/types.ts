import { type Row } from '../core/config.ts';

export type RouteResult = {
  html?: string;
  status?: number;
  location?: string;
};

export interface BlogSubmission {
  author: string;
  category: string;
  title: string;
  content: string;
}

export interface PublicPageModel {
  rows?: Row[];
  activities?: Row[];
  notifications?: Row[];
  sponsors?: Row[];
  students?: Row[];
  blogs?: Row[];
  article?: Row | null;
  recent?: Row[];
  kind?: string;
  blogForm?: { started: string; token: string };
  blogValues?: BlogSubmission;
  blogError?: string;
  blogSubmitted?: boolean;
}
