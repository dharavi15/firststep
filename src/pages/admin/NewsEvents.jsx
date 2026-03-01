import { useMemo, useState } from "react";

export default function NewsEvents() {
  const [selectedId, setSelectedId] = useState("");

  const newsItems = useMemo(
    () => [
      {
        id: "news-1",
        date: "FEBRUARY 26, 2026",
        title: "School Partnership Day: Learning Beyond the Classroom",
        image: "/src/assets/news/news-1.svg",
        excerpt:
          "A special event focused on real-world learning opportunities and community partnerships.",
        body: [
          "Our school held a Partnership Day to connect students with real-world learning experiences.",
          "Families were invited to explore student projects and meet partners supporting education.",
          "More details will be shared through the school newsletter.",
        ],
      },
      {
        id: "news-2",
        date: "FEBRUARY 24, 2026",
        title: "Campus Open House: Meet Our Teachers and Teams",
        image: "/src/assets/news/news-2.svg",
        excerpt:
          "Parents and students visited our campus to learn about programmes, facilities, and daily routines.",
        body: [
          "The Open House welcomed prospective families to experience our campus environment.",
          "Teachers shared class activities, learning goals, and how we support student growth.",
          "Thank you to all parents who joined us and asked thoughtful questions.",
        ],
      },
      {
        id: "news-3",
        date: "JANUARY 18, 2026",
        title: "Student Showcase: Creativity, Confidence, and Collaboration",
        image: "/src/assets/news/news-3.svg",
        excerpt:
          "A student showcase highlighting teamwork, creativity, and presentation skills.",
        body: [
          "Students presented their work to families and staff in a friendly showcase format.",
          "This event encouraged confidence, communication, and teamwork across year groups.",
          "We are proud of the effort and progress shown by every student.",
        ],
      },
      {
        id: "news-4",
        date: "DECEMBER 12, 2025",
        title: "Community Day: School Spirit and Family Activities",
        image: "/src/assets/news/news-4.svg",
        excerpt:
          "A day for families to enjoy activities together and strengthen our school community.",
        body: [
          "Community Day included games, booths, and student-led activities for families.",
          "We focused on building connection and celebrating our school spirit.",
          "Thank you to volunteers and staff who helped make the day successful.",
        ],
      },
      {
        id: "news-5",
        date: "NOVEMBER 06, 2025",
        title: "Health & Safety Update for Families",
        image: "/src/assets/news/news-5.svg",
        excerpt:
          "Important reminders on health routines, on-campus safety, and communication channels.",
        body: [
          "We shared an updated set of health and safety guidelines for students and families.",
          "Parents are encouraged to check email announcements for the latest reminders.",
          "If you have questions, please contact the school office for support.",
        ],
      },
      {
        id: "news-6",
        date: "OCTOBER 01, 2025",
        title: "Term Dates and Key Events Announcement",
        image: "/src/assets/news/news-6.svg",
        excerpt:
          "A summary of term dates, key school events, and important family reminders.",
        body: [
          "This announcement provides a quick overview of term dates and key events.",
          "Families can plan ahead for school activities and parent meetings.",
          "We will continue updating the calendar as new events are confirmed.",
        ],
      },
    ],
    []
  );

  const selectedNews = useMemo(() => {
    if (!selectedId) return null;
    return newsItems.find((n) => n.id === selectedId) || null;
  }, [selectedId, newsItems]);

  if (selectedNews) {
    return (
      <div className="pagePad">
        <div className="eventDetailBlock newsWrap">
          <div className="newsDetailTop">
            <button
              type="button"
              className="btnOutlinePrimary"
              onClick={() => setSelectedId("")}
            >
              Back
            </button>
          </div>

          <div className="newsDetailCard">
            <img
              className="newsDetailImage"
              src={selectedNews.image}
              alt={selectedNews.title}
            />

            <div className="newsDetailContent">
              <div className="newsDate">{selectedNews.date}</div>
              <div className="newsTitle">{selectedNews.title}</div>

              {selectedNews.body.map((p) => (
                <p key={p} className="newsParagraph">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pagePad">
      <div className="eventDetailBlock newsWrap">
        <div className="eventDetailTitle">News and Events</div>
        <div className="eventDetailDesc">
          Read highlights from our school’s life and important updates.
        </div>

        <div className="newsGrid">
          {newsItems.map((item) => (
            <div key={item.id} className="newsCard">
              <div className="newsImageWrap">
                <img className="newsImage" src={item.image} alt={item.title} />
              </div>

              <div className="newsBody">
                <div className="newsDate">{item.date}</div>
                <div className="newsTitle">{item.title}</div>
                <div className="newsExcerpt">{item.excerpt}</div>

                <button
                  type="button"
                  className="newsLink"
                  onClick={() => setSelectedId(item.id)}
                >
                  READ MORE <span className="newsArrow">›</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}