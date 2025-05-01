# CaseAsk

CaseAsk is a campus-wide, AI-moderated Q&A web application designed to help students ask and answer questions in a respectful, inclusive, and efficient learning environment. It features automatic content moderation using sentiment and language analysis, real-time updates, and user authentication. 

## Live Demo

[https://caseask.vercel.app](https://caseask.vercel.app)

## Architecture Overview

### System Architecture Diagram

![Architecture Diagram](./public/architecture.png)

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

Please refer to the provided `.env` file for all required environment variables to run the project:

[Download .env file](https://drive.google.com/file/d/110-YRQGPXGBryazU8DdsZ-TFbH6TltrO/view?usp=sharing)

Make sure to place the downloaded `.env` file in the root of the project directory.

1. Run the development server:

```bash
npm run dev
```

The application will be running at http://localhost:3000

## Usage / Examples

- Visit the site and sign up with CWRU email login.

- Use the prompt to submit a post.

- The system will auto-moderate using sentiment analysis.

- Posts are displayed to the public feed if safe, or flagged otherwise.

- Users can answer, or report questions.

- Moderators can remove or unremove prompts.

## Folder Structure

```
CSDS393_PROJECT/
├── .next/                   # Next.js build output (auto-generated)
├── docs/                    # Documentation
├── node_modules/            # Installed dependencies
├── public/                  # Static assets (e.g., images, icons)
├── src/                     # Source code
│   ├── assets/              # Custom images, fonts, etc.
│   ├── components/          # Reusable UI components
│   ├── icons/               # SVG or icon-specific components
│   ├── lib/                 # Utility functions (e.g., dbConnect)
│   ├── models/              # Mongoose/MongoDB schemas
│   ├── pages/               # Next.js pages and routes
│   │   ├── api/             # API route handlers (backend logic)
│   │   ├── components/      # Component-specific pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── frontpage/       # Landing/homepage content
│   ├── styles/              # Tailwind/global CSS and modules
│   ├── tests/               # Unit tests
```
  


## Tech Stack / Dependencies  
- **Frontend:** Next.js, React, TypeScript  

- **Backend:** Node.js, REST API (via Next.js API Routes)  

- **Database:** MongoDB Atlas  

- **Authentication:** Clerk  

- **Moderation:** Google Cloud Natural Language API  

- **Testing:** Jest, React Testing Library  

- **Deployment:** Vercel  

- **Documentation:** Typedoc

- **Other Tools:** ESLint, Prettier
 

## Contribution

- Khanh: Clerk Auth, Backend, AI feature and Deployment   
- Evan: Clerk Auth, Frontend, Style, and Moderation   
- Ricky: Frontend and debug the frontend and Backend API     
- Tahir: Backend, Database management, and Documentation   

## Development Retrospective

- **Test Coverage for Edge Cases:**  
  While major user flows were thoroughly tested, additional test cases could be added for edge conditions (e.g., network failures, unexpected API responses, or rare user behaviors).

- **Error Handling Consistency:**  
  Error handling in some API routes could be standardized to ensure consistent status codes and error messages across the application.

- **Frontend Validation:**  
  Client-side validation could be enhanced to prevent unnecessary API calls and provide faster feedback to users.

- **Moderation Threshold Tuning:**  
  The confidence threshold for content moderation was statically set. Future iterations could explore dynamic thresholds or user-specific moderation sensitivity.

- **Documentation Depth:**  
  While TypeDoc covers code structure well, additional context on high-level design decisions, data flow, and user interaction logic could make onboarding easier for new contributors.

- **Automated Deployment:**  
  Deployment to Vercel was manual. Setting up GitHub Actions or similar CI/CD tools to automate documentation updates and deployments would improve developer workflow.

## Testing
This project uses Jest and React Testing Library for unit testing frontend components and backend API routes.

Tests can be run using the following command:

```bash
npm test
```

To run a specific test file:

```bash
npm test -- src/tests/api.test.ts
```

Code coverage reports can be generated with:

```bash
npm run test:coverage
```

## Testing Summary

The unit tests are located in the `src/tests` directory and cover critical user flows and backend logic.

### Components Covered

- **User Authentication**  
  Simulated using mocked Clerk responses for login, session, and role-based logic.

- **Question Submission**  
  Tests ensure correct prompt creation, validation, and flagging behavior.

- **Answer Submission**  
  Verifies user response handling, storage, and retrieval for analytics.

- **AI Moderation Logic**  
  Covers content checks using GCP’s moderation API, including edge cases and confidence threshold filtering.

- **Flagging & Inappropriate Post Handling**  
  Tests report workflows and archiving behavior for reported content.

### Test Coverage

The current test suite covers approximately **100% of all major application flows**, including:

- Prompt creation and submission  
- Response handling  
- Moderation service interaction  
- API data validation and response structure

Authentication-related logic is thoroughly tested using **mocked Clerk APIs** to simulate various user roles and session states.

## Source Code Documentation

All classes, functions, interfaces, and modules are documented using TypeScript-style doc comments.

Documentation is generated using **TypeDoc**.

### Generate Documentation

```bash
npm run docs
```
The generated documentation is available at:

```bash
/docs/index.html
```

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

For questions, feedback, or collaboration inquiries, feel free to reach out:

Name: Khanh Khuat

Email: ltk30@case.edu

GitHub: github.com/KhanhKhuat1504