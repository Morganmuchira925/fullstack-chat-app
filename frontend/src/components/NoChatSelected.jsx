import React from "react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 lg:p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        
        {/* Animation Container */}
        <div className="flex justify-center mb-4">
          <div className="relative w-72 h-72">
            {/* This video acts as a mask. 
                The 'bg-primary' ensures the animation matches your current theme's primary color.
                'opacity-80' helps it blend smoothly into any background.
            */}
            <video
              src="/Cen6588hcjEY5Tt667.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain brightness-110 contrast-125 
                         dark:invert-[.05] pointer-events-none"
              style={{
                /* If your webm has a white background, we use this to filter it */
                filter: "contrast(1.1) brightness(1.1)",
                mixBlendMode: "multiply" // Good for light themes
              }}
            />
            
            {/* CSS HACK FOR DARK THEMES: 
               If the theme is dark, 'multiply' makes it disappear. 
               We add a subtle glow/backing so it's always visible.
            */}
            <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 rounded-full" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome to Convobuzz <span className="text-primary">⚆_⚆</span>
          </h2>
          <p className="text-base-content/60 max-w-sm mx-auto">
            Select a chat to start messaging or explore the settings to customize your experience.
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default NoChatSelected;