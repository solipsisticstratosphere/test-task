import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Testimonials.module.css";

import testimonialsData from "../../testimonials.json"; // <-- Укажите правильный путь к файлу

const TestimonialsPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Voices of Success with Sales Fortuna</h1>
        <div className={styles.sliderContainer}>
          <TestimonialSlider testimonials={testimonialsData} />
        </div>
      </div>
    </div>
  );
};

const TestimonialSlider = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSlidesPerView = () => {
    if (windowWidth <= 480) return 1;
    if (windowWidth <= 887) return 2;
    return 3;
  };

  const slidesPerView = getSlidesPerView();
  const totalSlides = testimonials.length;

  const createInfiniteSlides = () => {
    const copiesNeeded = 20;
    const extendedSlides = [];
    for (let copy = 0; copy < copiesNeeded; copy++) {
      for (let i = 0; i < totalSlides; i++) {
        extendedSlides.push({
          ...testimonials[i],
          id: `${testimonials[i].id}-copy-${copy}-${i}`,
          originalIndex: i,
        });
      }
    }
    return extendedSlides;
  };

  const infiniteSlides = createInfiniteSlides();
  const initialIndex = Math.floor(infiniteSlides.length / 2);

  const getSlideWidth = () => 100 / slidesPerView;

  const getLogicalIndex = () => {
    const slide = infiniteSlides[currentIndex];
    return slide ? slide.originalIndex : 0;
  };

  const getIndicatorCount = () => {
    if (slidesPerView >= totalSlides && totalSlides > 1) {
      return 2;
    }

    return totalSlides;
  };

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, []);

  React.useEffect(() => {
    const currentLogicalIndex = getLogicalIndex();
    const newMiddleIndex = Math.floor(infiniteSlides.length / 2);
    const targetIndex = infiniteSlides.findIndex(
      (slide, index) =>
        slide.originalIndex === currentLogicalIndex &&
        Math.abs(index - newMiddleIndex) < totalSlides
    );
    if (targetIndex !== -1) {
      setCurrentIndex(targetIndex);
    }
  }, [windowWidth]);

  const resetPositionIfNeeded = () => {
    const middleStart = Math.floor(infiniteSlides.length / 3);
    const middleEnd = Math.floor((infiniteSlides.length * 2) / 3);

    if (currentIndex < middleStart || currentIndex > middleEnd) {
      const currentLogicalIndex = getLogicalIndex();
      const newMiddleIndex = Math.floor(infiniteSlides.length / 2);
      const targetIndex = infiniteSlides.findIndex(
        (slide, index) =>
          slide.originalIndex === currentLogicalIndex &&
          Math.abs(index - newMiddleIndex) < totalSlides
      );
      if (targetIndex >= 0) {
        const track = document.querySelector(`.${styles.slidesTrack}`);
        if (track) track.style.transition = "none";

        setCurrentIndex(targetIndex);

        setTimeout(() => {
          if (track) track.style.transition = "";
        }, 50);
      }
    }
  };

  const navigate = (direction) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setCurrentIndex((prev) => prev + direction);

    setTimeout(() => {
      setIsTransitioning(false);

      resetPositionIfNeeded();
    }, 500);
  };

  const goToSlide = (bulletIndex) => {
    if (isTransitioning) return;

    let targetLogicalIndex = bulletIndex;

    1;
    if (slidesPerView >= totalSlides) {
      targetLogicalIndex = bulletIndex;
    }

    setIsTransitioning(true);

    const middleIndex = Math.floor(infiniteSlides.length / 2);
    const targetIndex = infiniteSlides.findIndex(
      (slide, index) =>
        slide.originalIndex === targetLogicalIndex &&
        Math.abs(index - middleIndex) < totalSlides * 2
    );

    setCurrentIndex(targetIndex >= 0 ? targetIndex : middleIndex);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const logicalIndex = getLogicalIndex();
  let activeIndicatorIndex = logicalIndex;

  if (getIndicatorCount() === 2) {
    activeIndicatorIndex = logicalIndex % 2;
  }

  return (
    <div className={styles.sliderWrapper}>
      <button
        onClick={() => navigate(-1)}
        disabled={isTransitioning}
        className={`${styles.navButton} ${styles.navButtonPrev} ${
          isTransitioning ? styles.disabled : ""
        }`}
      >
        <ChevronLeft className={styles.navIcon} />
      </button>

      <button
        onClick={() => navigate(1)}
        disabled={isTransitioning}
        className={`${styles.navButton} ${styles.navButtonNext} ${
          isTransitioning ? styles.disabled : ""
        }`}
      >
        <ChevronRight className={styles.navIcon} />
      </button>

      <div className={styles.slidesContainer}>
        <div
          className={`${styles.slidesTrack} ${
            isTransitioning ? styles.transitioning : ""
          }`}
          style={{
            transform: `translateX(-${currentIndex * getSlideWidth()}%)`,
          }}
        >
          {infiniteSlides.map((testimonial) => (
            <div
              key={testimonial.id}
              className={styles.slide}
              style={{ width: `${getSlideWidth()}%` }}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.indicators}>
        {Array.from({ length: getIndicatorCount() }, (_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.indicator} ${
              index === activeIndicatorIndex ? styles.indicatorActive : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <div
      className={`${styles.card} ${
        testimonial.paddingClass ? styles[testimonial.paddingClass] : ""
      }`}
    >
      <div className={styles.logoWrapper}>
        <img
          src={testimonial.logo}
          alt={`${testimonial.company} logo`}
          className={`${styles.logo} ${
            styles[testimonial.company.replace(/\s+/g, "").toLowerCase()]
          }`}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className={styles.logoFallback}>
          {testimonial.company
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </div>
      </div>

      <div className={styles.testimonialContent}>
        <p className={styles.testimonialText}>{testimonial.text}</p>
        <span className={styles.quoteIcon}>“</span>
      </div>

      <div className={styles.authorInfo}>
        <div className={styles.avatarContainer}>
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className={styles.avatar}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className={styles.avatarFallback}>
            <span>
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
        </div>
        <div className={styles.authorDetails}>
          <h4 className={styles.authorName}>{testimonial.name}</h4>
          <p className={styles.authorPosition}>{testimonial.position}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPage;
