import React from "react";
const I = (p)=> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}/>;
export const IOverview = (p)=><I {...p}><path d="M3 12h7v9H3z"/><path d="M14 3h7v18h-7z"/><path d="M3 3h7v7H3z"/></I>;
export const IUsers = (p)=><I {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>;
export const ISites = (p)=><I {...p}><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></I>;
export const IClock = (p)=><I {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></I>;
export const IInbox = (p)=><I {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M7 21h10a2 2 0 0 0 2-2v-7"/></I>;
export const IFile = (p)=><I {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></I>;
export const IMoney = (p)=><I {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></I>;
export const ISettings = (p)=><I {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 4.03 3.4l.06.06c.47.47 1.14.61 1.82.33.68-.28 1.11-.94 1.09-1.66V2a2 2 0 1 1 4 0v.09c.02.72.41 1.38 1.09 1.66.68.28 1.35.14 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.47.47-.61 1.14-.33 1.82.28.68.94 1.11 1.66 1.09H22a2 2 0 1 1 0 4h-.09c-.72-.02-1.38.41-1.66 1.09z"/></I>;
export const IHeart = (p)=><I {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></I>;
export const IAlert = (p)=><I {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></I>;
export default {};


