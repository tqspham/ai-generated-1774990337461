"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { ArrowLeft, ArrowRight, Play, Pause, Maximize, Minimize, Grid } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  thumbnailUrl: string;
};

const fetchPhotos = async (): Promise<Photo[]> => {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/photos?_limit=10");
    if (!response.ok) throw new Error("Error loading photos");
    return response.json();
  } catch {
    throw new Error("Error loading photos");
  }
};

const App = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isThumbnailView, setIsThumbnailView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await fetchPhotos();
        setPhotos(photos);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    loadPhotos();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  }, [photos.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const toggleThumbnailView = () => {
    setIsThumbnailView((prev) => !prev);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsThumbnailView(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (photos.length === 0) {
    return <div className="flex justify-center items-center h-screen">No photos available.</div>;
  }

  return (
    <div className={twMerge("flex flex-col items-center justify-center h-screen", isFullscreen && "bg-black")}>
      {isThumbnailView ? (
        <div className="grid grid-cols-3 gap-4 p-4">
          {photos.map((photo, index) => (
            <div key={photo.id} onClick={() => handleThumbnailClick(index)} className="cursor-pointer">
              <Image src={photo.thumbnailUrl} alt={`Thumbnail ${index + 1}`} width={150} height={150} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <Image src={photos[currentIndex].url} alt={`Photo ${currentIndex + 1}`} width={800} height={600} />
          <div className="absolute top-0 left-0 p-4">
            <button onClick={toggleThumbnailView} className="text-white">
              <Grid />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
            <button onClick={handlePrevious} className="text-white">
              <ArrowLeft />
            </button>
            <button onClick={togglePlay} className="text-white">
              {isPlaying ? <Pause /> : <Play />}
            </button>
            <button onClick={toggleFullscreen} className="text-white">
              {isFullscreen ? <Minimize /> : <Maximize />}
            </button>
            <button onClick={handleNext} className="text-white">
              <ArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;