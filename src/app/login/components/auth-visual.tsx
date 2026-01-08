'use client';

const AuthVisual = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] [background:radial-gradient(ellipse_at_20%_30%,rgba(156,220,182,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_70%,rgba(100,150,200,0.15)_0%,transparent_50%),#0a0a0a]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(2px_2px_at_20%_30%,white,transparent),radial-gradient(2px_2px_at_60%_70%,white,transparent),radial-gradient(1px_1px_at_50%_50%,white,transparent),radial-gradient(1px_1px_at_80%_10%,white,transparent),radial-gradient(2px_2px_at_90%_60%,white,transparent),radial-gradient(1px_1px_at_33%_80%,white,transparent),radial-gradient(1px_1px_at_15%_60%,white,transparent)] [background-size:200%_200%] opacity-50 animate-twinkle"></div>
      <div className="absolute top-[-10%] right-[-30%] w-[120%] h-[120%] rounded-full [background:radial-gradient(circle_at_30%_30%,rgba(180,230,200,0.3)_0%,transparent_40%),radial-gradient(circle_at_70%_70%,rgba(100,150,180,0.2)_0%,transparent_50%),linear-gradient(135deg,rgba(50,80,70,0.4)_0%,rgba(30,50,60,0.4)_100%)] blur-sm animate-float after:absolute after:inset-[10%] after:rounded-full after:[background:radial-gradient(circle_at_40%_30%,rgba(255,255,255,0.1)_0%,transparent_30%)] after:blur-xl"></div>
      <div className="absolute top-[45%] left-[-20%] w-[140%] h-[5%] rounded-[50%] border-2 border-[rgba(156,220,182,0.2)] [transform:rotateX(75deg)_rotateZ(-10deg)] opacity-40 before:absolute before:inset-[-10%] before:rounded-[50%] before:border before:border-[rgba(156,220,182,0.15)] after:absolute after:inset-[-20%] after:rounded-[50%] after:border after:border-[rgba(156,220,182,0.1)]"></div>
    </>
  );
  
  export { AuthVisual };
  
  // Note: CSS keyframes are defined in tailwind.config.ts and globals.css for animations.
  