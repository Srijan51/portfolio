import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already have projects
    if db.query(models.Project).first():
        print("Database already seeded.")
        return

    print("Seeding database...")
    
    # 1. Projects
    projects = [
        models.Project(title="Attendance Calculator", description="Calculate your attendance percentage instantly. Plan how many classes you need to attend or can skip while maintaining your target attendance.", tags=["HTML", "CSS", "JavaScript"], live_url="https://srijan51.github.io/attendance-calculator/", github_url="https://github.com/Srijan51/attendance-calculator", icon_emoji="📊", is_featured=True, display_order=1),
        models.Project(title="To-Do Task Planner", description="A clean and intuitive task management application. Add, complete, and delete tasks with a beautiful, responsive interface to stay organized.", tags=["HTML", "CSS", "JavaScript"], live_url="https://srijan51.github.io/to-do-list/", github_url="https://github.com/Srijan51/to-do-list", icon_emoji="✅", is_featured=True, display_order=2),
        models.Project(title="Expense Tracker", description="Track your income and expenses with a visual breakdown. Stay on top of your finances with this simple and effective budgeting tool.", tags=["HTML", "CSS", "JavaScript"], live_url="https://srijan51.github.io/expense-tracker/", github_url="https://github.com/Srijan51/expense-tracker", icon_emoji="💰", is_featured=True, display_order=3)
    ]
    db.add_all(projects)

    # 2. Blog Posts
    posts = [
        models.BlogPost(title="Building My Portfolio Website From Scratch", excerpt="How I designed and built this portfolio using vanilla HTML, CSS, and JavaScript — with smooth animations and a dark theme.", category="Web Dev", published_date="Mar 2026"),
        models.BlogPost(title="Getting Started With Python: My Learning Path", excerpt="A beginner's perspective on learning Python — the resources I used, mistakes I made, and what worked best for me.", category="Python", published_date="Feb 2026"),
        models.BlogPost(title="My First Semester as a CSE Student", excerpt="Reflections on starting B.Tech — balancing academics, self-learning, and building projects alongside college.", category="College Life", published_date="Jan 2026")
    ]
    db.add_all(posts)

    # 3. Certifications
    certs = [
        models.Certification(title="Python Basic Certificate", issuer="HackerRank", year="2026", description="Validated foundational Python skills including data types, control flow, functions, and object-oriented basics.", icon_emoji="🐍", certificate_url="certificates/python_basic%20certificate.pdf", display_order=1),
        models.Certification(title="Programming with Generative AI", issuer="NPTEL", year="2025", description="Learned how to leverage generative AI tools for programming, prompt engineering, and building AI-powered applications.", icon_emoji="🤖", certificate_url="certificates/Programming%20with%20Generative%20AI.pdf", display_order=2),
        models.Certification(title="Data Analytics Job Simulation", issuer="Deloitte", year="2025", description="Professional development certification from Deloitte covering industry-relevant skills and practices.", icon_emoji="💼", certificate_url="certificates/Deloitte%20Certificate.pdf", display_order=3),
        models.Certification(title="Basics of Data Structures and Algorithms", issuer="SimpliLearn", year="2025", description="Recognition of skills and knowledge demonstrated through coursework and practical assessments.", icon_emoji="📜", certificate_url="certificates/Certificate.pdf", display_order=4)
    ]
    db.add_all(certs)

    # 4. Skills
    skills = [
        models.Skill(name="HTML", category="Web Development", proficiency_percent=85, display_order=1),
        models.Skill(name="CSS", category="Web Development", proficiency_percent=80, display_order=2),
        models.Skill(name="JavaScript", category="Web Development", proficiency_percent=70, display_order=3),
        models.Skill(name="Python", category="Programming", proficiency_percent=75, display_order=1),
        models.Skill(name="Java", category="Programming", proficiency_percent=65, display_order=2),
        models.Skill(name="SQL", category="Programming", proficiency_percent=55, display_order=3),
        models.Skill(name="Git & GitHub", category="Tools & Platforms", proficiency_percent=70, display_order=1),
        models.Skill(name="VS Code", category="Tools & Platforms", proficiency_percent=85, display_order=2),
        models.Skill(name="GitHub Pages", category="Tools & Platforms", proficiency_percent=75, display_order=3),
    ]
    db.add_all(skills)

    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
