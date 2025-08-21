# Overview

This is a fully functional PDF analysis and comparison application built based on FastAPI requirements. The application features a modern React frontend with minimalistic black and white design, allowing users to upload two PDF documents simultaneously, extract text content (with OCR fallback), generate AI-powered summaries using OpenAI, and perform detailed document comparisons. The system combines a React frontend with an Express.js backend and Python services for PDF processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with shadcn/ui components for consistent, accessible interface elements
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **Animation**: Framer Motion for smooth UI transitions and loading states

The frontend implements a drag-and-drop file upload interface with real-time processing status updates and comprehensive results visualization.

## Backend Architecture
The server-side follows a modular Express.js architecture with clear separation of concerns:

- **Web Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for document upload, processing, and comparison
- **File Handling**: Multer for multipart file uploads with size limits and type validation
- **Processing Pipeline**: Multi-step document processing (upload → text extraction → summarization → comparison)
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Development**: Hot-reload with tsx for rapid development iteration

## Data Storage Solutions
The application uses a PostgreSQL database with Drizzle ORM for type-safe database operations:

- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for schema definition and query building
- **Schema**: Three main tables for documents, comparisons, and API usage tracking
- **Migrations**: Drizzle Kit for database schema versioning
- **Connection**: Neon serverless driver for efficient connection pooling

The schema tracks document metadata, extracted text, processing status, comparison results, and detailed API usage analytics.

## Authentication and Authorization
Currently implements a simple in-memory storage system with plans for database integration:

- **Storage Interface**: Abstract storage interface allowing for easy swapping between implementations
- **Session Management**: Express sessions for maintaining user state
- **File Security**: Server-side file validation and secure upload handling
- **API Protection**: All endpoints protected with proper error handling

## External Service Integrations

### AI and Machine Learning
- **OpenAI API**: GPT models for document summarization and intelligent comparison analysis
- **OCR Processing**: Tesseract via pytesseract for extracting text from image-based PDFs
- **PDF Processing**: PyPDF2 for standard PDF text extraction with OCR fallback

### Development and Deployment
- **Replit Integration**: Custom Vite plugins for Replit-specific development features
- **Environment Management**: Secure environment variable handling for API keys and database credentials
- **File System**: Local file storage with organized upload directory structure

### Frontend Dependencies
- **Component Library**: Comprehensive shadcn/ui component suite built on Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Date Handling**: date-fns for consistent date formatting and manipulation
- **Utilities**: clsx and tailwind-merge for conditional styling

The architecture is designed for scalability and maintainability, with clear interfaces between components and proper error handling throughout the stack.

## Recent Changes (August 17, 2025)

✓ **Complete Application Implementation**: Built full-featured PDF analyzer based on FastAPI backend requirements
✓ **Modern UI Design**: Created minimalistic black and white interface with two upload boxes for Document 1 and Document 2
✓ **Enhanced Animations**: Added smooth Framer Motion animations throughout the interface for professional user experience
✓ **PDF Processing Pipeline**: Implemented complete text extraction with PyPDF2 and OCR fallback using Tesseract
✓ **AI Integration**: Connected OpenAI API for document summarization and intelligent comparison analysis
✓ **Processing Status**: Added real-time progress tracking with step-by-step status indicators
✓ **Results Display**: Built comprehensive results section showing summaries, similarity scores, and detailed analysis
✓ **Error Handling**: Fixed all TypeScript errors and implemented proper error handling throughout the stack
✓ **Environment Setup**: Configured OpenAI API key integration for AI-powered features

The application is now fully operational and ready for document analysis and comparison tasks.