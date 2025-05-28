'use client'; // This component now uses useEffect, so it must be a client component

import type { Metadata } from "next";
import "./globals.css";
import { useEffect } from 'react'; // Import useEffect

// export const metadata: Metadata = { // Cannot use metadata export in a client component. Manage dynamically if needed.
//   title: "Cuber Timer App",
//   description: "A simple timer app for speedcubers, installable as a PWA.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Set metadata dynamically
    document.title = "Cuber Timer App";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'A simple timer app for speedcubers, installable as a PWA.');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = 'A simple timer app for speedcubers, installable as a PWA.';
      document.head.appendChild(newMeta);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    }

    // Add manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // Add theme color meta tag (optional, often handled by manifest but good for consistency)
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', "#0000FF"); // Blue, as in manifest

  }, []);

  return (
    <html lang="en">
      <head>
        {/* Static head elements can go here if needed, but manifest and dynamic meta are handled in useEffect */}
      </head>
      <body>{children}</body>
    </html>
  );
}
