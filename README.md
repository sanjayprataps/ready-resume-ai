# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/2b0cdaca-c7f6-45c8-beac-90c14d77ce88

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2b0cdaca-c7f6-45c8-beac-90c14d77ce88) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2b0cdaca-c7f6-45c8-beac-90c14d77ce88) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Resume AI Backend

This is the backend service for the Resume AI application, providing resume analysis, optimization, and cover letter generation capabilities.

## Deployment on Render

### Prerequisites
1. A Render account (https://render.com)
2. Your Groq API key

### Deployment Steps

1. **Fork/Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Create a New Web Service on Render**
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the Service**
   - Name: `resume-ai-backend`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   - Add your `GROQ_API_KEY` in the Environment section
   - The key should be marked as "Secret"

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your application

### Environment Variables

- `GROQ_API_KEY`: Your Groq API key (required)
- `PYTHON_VERSION`: Set to 3.9.0 (automatically set in render.yaml)

### API Endpoints

- `POST /analyze-resume`: Analyze a resume against a job description
- `POST /generate-resume`: Generate a professional resume
- `POST /api/generate-cover-letter`: Generate a personalized cover letter
- `POST /api/generate-portfolio`: Generate a portfolio website

### Local Development

1. **Set up virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file**
   ```
   GROQ_API_KEY=your_api_key_here
   ```

4. **Run the server**
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation

Once deployed, you can access the API documentation at:
- Swagger UI: `https://your-app-name.onrender.com/docs`
- ReDoc: `https://your-app-name.onrender.com/redoc`
