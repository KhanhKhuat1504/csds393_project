# CaseAsk

CaseAsk is a campus-wide, AI-moderated Q&A web application designed to help students ask and answer questions in a respectful, inclusive, and efficient learning environment. It features automatic content moderation using sentiment and language analysis, real-time updates, and user authentication. 

---

## Live Demo

[https://caseask.vercel.app](https://caseask.vercel.app)

---

## Architecture Overview

### System Architecture Diagram

![Architecture Diagram](./public/architecture.png)

**Main Components:**
- **Frontend:** Next.js with TypeScript
- **Backend:** Node.js API Routes (serverless)
- **Database:** MongoDB Atlas
- **Authentication:** Clerk
- **Moderation:** Google Cloud Natural Language API
- **Deployment:** Vercel

---

## Getting Started / Installation

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- MongoDB URI (MongoDB Atlas or local instance)
- Clerk API credentials (Publishable and Secret Key)
- Google Cloud Natural Language API Key

### Installation Steps

1. Clone the repository:

   
```bash
   git clone https://github.com/KhanhKhuat1504/csds393_project.git
   cd csds393_project
```

2. Install dependencies:
```bash
  npm install
```
3. Set up environment variables:

Create a .env.local file and populate it with:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
SIGNING_SECRET=your_webhook_secret
MONGODB_URI=your_mongodb_uri
GOOGLE_API_KEY=your_google_api_key
GCP_KEY_B64=your_google_api_key_in_base64
```

4. Run the development server:

```bash
npm run dev
```

The application will be running at http://localhost:3000

## Usage / Examples

Visit the site and sign up with CWRU email login.

Use the prompt to submit a post.

The system will auto-moderate using sentiment analysis.

Posts are displayed to the public feed if safe, or flagged otherwise.

Users can answer, or report questions.

## Folder Structure

CSDS393_PROJECT/  
├── .next/                     # Next.js build output (auto-generated)    
├── node_modules/              # Installed dependencies   
├── public/                    # Static assets (e.g., images, icons)    
├── src/                       # Source code    
│   ├── assets/                # Custom images, fonts, etc.   
│   ├── components/            # Reusable UI components   
│   ├── icons/                 # SVG or icon-specific components    
│   ├── lib/                   # Utility functions (e.g., dbConnect)    
│   ├── models/                # Mongoose/MongoDB schemas   
│   ├── pages/                 # Next.js pages and routes   
│   │   ├── api/               # API route handlers (backend logic)   
│   │   ├── components/        # Component-specific pages      
│   │   ├── dashboard/         # Dashboard pages    
│   │   ├── frontpage/         # Landing/homepage content   
│   ├── styles/                # Tailwind/global CSS and modules    
│   ├── tests/                 # Unit tests   


## Tech Stack / Dependencies  
Frontend: Next.js, React, TypeScript  

Backend: Node.js, REST API (via Next.js API Routes) 

Database: MongoDB Atlas 

Authentication: Clerk.dev 

Moderation: Google Cloud Natural Language API 

Testing: Jest, React Testing Library  

Deployment: Vercel  

Other Tools: ESLint, Prettier, GitHub Actions (CI), JSDoc 

## Contribution

Khanh: Worked on Clerk Auth, Backend, AI feature and Deployment   
Evan: Worked on Clerk Auth, Frontend, Style, and Moderation   
Ricky: Worked on frontend and debug the frontend and backend api  
Tahir: Backend, and Database management   

## Development Retrospective
What Could Be Improved

## Testing
This project uses Jest and React Testing Library for unit testing frontend components and backend API routes.

Run tests:

```bash
npm run test
```

## testing.md Summary
Unit tests are located in the /tests directory.

Components tested:

User Authentication

Question Submission

Answer Submission

AI Moderation logic

Flagging/Inappropriate Post handling

Test Coverage
We cover ~85% of major flows: posting, answering, flagging, and moderation.

Auth-related flows are tested using Clerk’s mocked responses.

## Source Code Documentation
All classes, functions, and modules include Google-style docstrings.

Documentation generated using JSDoc.

Generate docs:
```bash
npx jsdoc -c jsdoc.config.json
```

Generated HTML docs are located in:

/docs/html/index.html


## License
This project is open-source and licensed under the MIT License.

## Contact

