# FirstStep – Project Rules & Architecture

## Project Overview
**Project Name:** FirstStep  
**Group Project:** Photsathon & Shweta  

FirstStep is a web application for private schools.  
It helps schools create clear onboarding journeys for parents and students.

Instead of using emails, chat apps, or paper, everything is shown in **one clear digital flow**.

---

## Project Goal
- Make school onboarding simple and stress-free
- Show clear steps, deadlines, and status
- Support both **Admin (school staff)** and **Parent** users
- Work well on **mobile first**

---

## User Roles & Views

### 1. Admin View (School Staff)
Admin users can:
- Create onboarding flows
- Add, edit, and reorder steps
- Define step types:
  - Documents
  - Payments
  - Health forms
  - Orientation
- Set deadlines and requirements
- Publish flows for parents

### 2. Parent View
Parent users can:
- See only their own onboarding flow
- Follow steps one by one
- Upload documents
- Track progress and status
- Use the system easily on mobile

---

## Tech Stack

### Frontend
- React
- JavaScript
- Next.js
- CSS

### Forms & Validation
- React Hook Form
- Zod (validation rules)

### UI Features
- Drag-and-drop library (for step order)
- Stepper / checklist UI
- Status states (todo / completed / approved)

### Data
- Local storage / JSON (initial version)
- Optional: Firebase 
  - Authentication
  - Data storage

---

## Architecture (How the App Is Built)

### Structure (Simple)
- **Pages**
  - Admin pages
  - Parent pages
- **Components**
  - Step cards
  - Forms
  - Buttons
  - Status badges
- **State**
  - Flow data
  - Step status
  - Language (TH / EN)
- **Validation**
  - All forms validated before submit

### Data Flow
1. Admin creates onboarding steps
2. Steps are saved (local or database)
3. Parent sees the published flow
4. Parent completes steps in order
5. Progress and status update automatically

---

## Design & UX Rules
- Mobile-first design
- Clear hierarchy (what to do next)
- Minimal UI (no clutter)
- Accessibility:
  - Readable text
  - Clear buttons
  - Simple navigation
- Bilingual UI:
  - Thai
  - English

---

## What We Want to Learn
- UX design for admin tools
- Step-based flow design
- Complex form validation
- Drag-and-drop interfaces
- State management
- Role-based UI (Admin vs Parent)
- Accessibility & mobile design
- Planning and building a real product

---

## Project Planning Rules
- This plan must be approved before development
- Work is divided by week
- Each week has clear goals
- Risks are reviewed every week

---

## Weekly Plan

### Week 1 – Research & Design
**Tasks**
- UX research
- Create user personas
- Define onboarding flows
- Wireframes & UI mockups (Figma)
- Test mockups with at least one user
- Check mobile & accessibility

**Risks**
- Too much feedback slows decisions
- Spending too much time on UX

---

### Week 2 – Core UI & Structure
**Tasks**
- Build UI components
  - Stepper
  - Cards
  - Forms
  - Status states
- Start Flow Builder UI
- Set up basic data structure

**Risks**
- Drag-and-drop may take longer
- Components may need refactoring

---

### Week 3 – Main Features
**Tasks**
- Complete Flow Editor (create / edit steps)
- Build Parent view
- Checklist with progress tracking
- Add preview mode

**Risks**
- State management complexity
- Bugs with step order and validation

---

### Week 4 – Final Polish
**Tasks**
- Language toggle (Thai / English)
- Fix remaining bugs
- Prepare report and presentation
- Prepare opposition

**Risks**
- Testing and polish take longer
- Time pressure near deadline

---

## Final Delivery
- Submit report draft
- Submit opposition
- Fix final bugs
- Prepare and present the project

---

## Project Risks (General)
- Technical complexity
- Design changes during development
- Underestimating development time

To reduce risks:
- Define scope clearly
- Work step by step
- Review progress every week