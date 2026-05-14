# ProGst - Smart GST & Inventory Management System

ProGst is a comprehensive, full-stack business management solution designed for Indian businesses. It integrates GST invoicing, inventory management, and AI-driven business analytics into a seamless cross-platform experience.

## 🚀 Project Overview

This project consists of three main components:
1.  **Mobile App (React Native/Expo)**: A premium mobile experience for on-the-go invoicing and inventory scanning.
2.  **Backend (Laravel)**: A robust RESTful API that handles data synchronization, AI analytics, and global product lookups.
3.  **Web Dashboard (React/Vite)**: A web-based interface for managing the business from a desktop.

## ✨ Core Features

### 🧠 AI Business Assistant
*   **Real-time Insights**: Natural language queries for sales, expenses, and profit analysis.
*   **Data Visualization**: Integrated charts (Line & Bar) to visualize business growth.
*   **Smart Suggestions**: Intelligent prompts for deep-diving into business health.

### 🔍 Smart Barcode Scanner
*   **Multi-Source Lookup**: Automatically fetches product details from **UPCItemDB** and **Open Food Facts**.
*   **Intelligent HSN Matching**: Auto-assigns Indian GST HSN codes based on product categories.
*   **Inventory Sync**: Seamlessly adds scanned products to the local database with pre-filled metadata.

### 📊 Inventory & Invoicing
*   **GST Compliant**: Built-in support for HSN codes and GST calculations.
*   **Stock Management**: Real-time tracking of product quantities and value.
*   **Dynamic Dashboard**: Instant view of revenue, expenses, and unpaid invoices.

## 🛠 Tech Stack

*   **Frontend**: React, Vite, Lucide Icons.
*   **Mobile**: React Native, Expo, Reanimated, React Native Chart Kit.
*   **Backend**: Laravel 10+, MySQL, PHP 8.2+.
*   **APIs**: UPCItemDB, Open Food Facts.

## ⚙️ Installation & Setup

### Backend (Laravel)
1.  Navigate to `/backend`.
2.  Install dependencies: `composer install`.
3.  Set up environment: `cp .env.example .env` and configure your database.
4.  Run migrations: `php artisan migrate`.
5.  Start server: `php artisan serve`.

### Mobile (React Native)
1.  Navigate to `/mobile`.
2.  Install dependencies: `npm install`.
3.  Update `src/config.js` with your local server IP.
4.  Start Expo: `npx expo start`.

---

**Developed with ❤️ by Antigravity AI Assistant.**
