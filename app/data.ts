export type Tool = {
  rank: number;
  name: string;
  category: string;
  helps: string;
  price: string;
  budgetFit: string;
  link: string;
  /** Optional tracked partner URL; falls back to `link` when unset. */
  affiliateLink?: string;
  roles: string[];
  shortDescription?: string;
  howToUse?: string[];
  examplePrompt?: string;
};

export const rolesList = [
  "Director",
  "DOP (Director of Photography)",
  "1st Assistant Director",
  "2nd Assistant Director",
  "Gaffer (Lighting)",
  "Key Grip",
  "Script Supervisor",
  "Location Manager",
  "Production Designer",
  "Costume Designer",
  "Make-up Artist",
  "Producer / Line Producer",
  "Production Coordinator",
  "Lawyer / Clearance",
  "Editor",
  "Sound Designer",
];

export const allTools = [
  {
    rank: 1,
    name: "Higgsfield Cinema Studio",
    category: "Production",
    helps: "Applies real film camera profiles (ARRI, RED), accurate lens characteristics, and cinematic lighting directly to your footage or text prompts",
    price: "from $9/mo (Free tier available)",
    budgetFit: "both",
    link: "higgsfield.ai",
    roles: ["DOP (Director of Photography)", "Director", "Gaffer (Lighting)"],
    shortDescription: "Instant cinematic look using real ARRI/RED camera profiles and lens simulation",
    howToUse: [
      "Step 1: Go to higgsfield.ai and create a free account",
      "Step 2: Upload your raw footage or start with a text prompt describing the scene",
      "Step 3: Choose a real film camera profile (ARRI Alexa, RED, etc.) and lens",
      "Step 4: Adjust lighting, depth of field, and add subtle VFX previews",
      "Step 5: Export the enhanced clip and import into your editor"
    ],
    examplePrompt: "A rainy neon street in Tokyo at night, shot on ARRI Alexa Mini LF with anamorphic lenses, moody blue and pink lighting, shallow depth of field, cinematic film grain"
  },
  {
    rank: 2,
    name: "Runway Gen-4.5",
    category: "Post-Prod",
    helps: "High-quality text-to-video and image-to-video generation with precise motion brush control",
    price: "from $15/mo (Free tier available)",
    budgetFit: "hollywood",
    link: "runwayml.com",
    roles: ["Editor", "DOP (Director of Photography)", "Director"],
    shortDescription: "Powerful text-to-video tool with excellent motion control and VFX capabilities",
    howToUse: [
      "Step 1: Go to runwayml.com and sign up",
      "Step 2: Choose text-to-video or image-to-video mode",
      "Step 3: Write a detailed prompt or upload an image",
      "Step 4: Use motion brush to control specific movements if needed",
      "Step 5: Generate and download the video"
    ],
    examplePrompt: "A cyberpunk samurai walking through a rainy Tokyo street at night, neon lights reflecting on wet pavement, cinematic lighting, slow motion, highly detailed, 4K"
  },
  {
    rank: 3,
    name: "ElevenLabs Voice Cloning",
    category: "Post-Prod",
    helps: "Industry-leading voice cloning, emotional voiceovers, and multi-language dubbing",
    price: "from $5/mo (Free tier available)",
    budgetFit: "both",
    link: "elevenlabs.io",
    roles: ["Sound Designer", "Editor", "Director"],
    shortDescription: "Best-in-class AI voice cloning and professional dubbing for film",
    howToUse: [
      "Step 1: Go to elevenlabs.io and create an account",
      "Step 2: Upload a short clean audio sample of the voice you want to clone",
      "Step 3: Paste your script or type the dialogue",
      "Step 4: Adjust emotion, pacing, accent, and stability",
      "Step 5: Generate and download the audio file"
    ],
    examplePrompt: "A calm, professional male narrator with slight British accent reading: 'In the quiet moments before dawn, the city held its breath.'"
  },
  {
    rank: 4,
    name: "LTX Studio",
    category: "Pre-Prod",
    helps: "AI-powered storyboarding and production-ready script-to-visual conversion",
    price: "from $10/mo (Free tier available)",
    budgetFit: "indie",
    link: "ltx.studio",
    roles: ["Director", "Production Designer", "Storyboard Artist"],
    shortDescription: "Fast script-to-storyboard tool with reliable character and location continuity",
    howToUse: [
      "Step 1: Go to ltx.studio and sign up",
      "Step 2: Upload your script or write a scene description",
      "Step 3: Let AI generate storyboards automatically",
      "Step 4: Edit characters, camera angles, and style",
      "Step 5: Export storyboards as images or PDF"
    ],
    examplePrompt: "A tense confrontation in a dimly lit warehouse between a detective and a suspect, rainy night, cinematic lighting"
  },
  {
    rank: 5,
    name: "Pika Labs",
    category: "Production",
    helps: "Fast text-to-video and image-to-video generation for quick clips and VFX previews",
    price: "from $8/mo (Free tier available)",
    budgetFit: "both",
    link: "pika.art",
    roles: ["Director", "Editor", "Gaffer (Lighting)"],
    shortDescription: "Quick and creative text-to-video tool perfect for on-set previews",
    howToUse: [
      "Step 1: Go to pika.art and create an account",
      "Step 2: Write a text prompt or upload an image",
      "Step 3: Generate multiple variations",
      "Step 4: Extend or remix the best clips",
      "Step 5: Download and import into your editor"
    ],
    examplePrompt: "A slow motion shot of a car exploding with fire and debris flying, cinematic, 4K"
  },
  {
    rank: 6,
    name: "Midjourney",
    category: "Pre-Prod",
    helps: "High-quality concept art, storyboards, and visual references",
    price: "from $10/mo",
    budgetFit: "both",
    link: "midjourney.com",
    roles: ["Production Designer", "Director", "Storyboard Artist"],
    shortDescription: "Best AI image generator for concept art and storyboarding",
    howToUse: [
      "Step 1: Go to midjourney.com and join via Discord",
      "Step 2: Type /imagine followed by your prompt",
      "Step 3: Generate several variations",
      "Step 4: Upscale the best images",
      "Step 5: Download and use in your storyboard"
    ],
    examplePrompt: "Cinematic concept art of a futuristic detective standing on a rainy rooftop, neon lights, blade runner style, highly detailed, dramatic lighting"
  },
  {
    rank: 7,
    name: "Flawless AI",
    category: "Post-Prod",
    helps: "AI-assisted performance and dialogue editing",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "flawlessai.com",
    roles: ["Editor", "Sound Designer"],
    shortDescription: "AI tool for fixing and enhancing actor performances in post",
    howToUse: [
      "Step 1: Go to flawlessai.com and sign up",
      "Step 2: Upload your video clip with dialogue",
      "Step 3: Select the performance you want to improve",
      "Step 4: Let AI generate improved versions",
      "Step 5: Export and replace in your timeline"
    ],
    examplePrompt: "Improve the emotional delivery of this angry confrontation scene while keeping lip sync perfect"
  },
  {
    rank: 8,
    name: "Wonder Studio",
    category: "Production",
    helps: "AI character animation and VFX integration",
    price: "from $40/mo",
    budgetFit: "hollywood",
    link: "wonder.studio",
    roles: ["VFX Artist", "Director"],
    shortDescription: "AI-powered character animation for VFX shots",
    howToUse: [
      "Step 1: Go to wonder.studio and create an account",
      "Step 2: Upload your plate footage",
      "Step 3: Add a character rig or use pre-built",
      "Step 4: Let AI animate the character",
      "Step 5: Export and composite in your editor"
    ],
    examplePrompt: "Animate a superhero landing dramatically on a city street at night"
  },
  {
    rank: 9,
    name: "Topaz Video AI",
    category: "Post-Prod",
    helps: "AI video upscaling, denoising, and quality enhancement",
    price: "from $299 one-time",
    budgetFit: "both",
    link: "topazlabs.com",
    roles: ["Editor", "DOP (Director of Photography)"],
    shortDescription: "Best tool for upscaling and restoring old or low-quality footage",
    howToUse: [
      "Step 1: Download and install Topaz Video AI",
      "Step 2: Import your video file",
      "Step 3: Choose upscaling, denoising, or stabilization model",
      "Step 4: Adjust settings and preview",
      "Step 5: Export the enhanced video"
    ],
    examplePrompt: "Upscale this 1080p footage to 4K while removing noise and sharpening details"
  },
  {
    rank: 10,
    name: "Luma Ray",
    category: "Post-Prod",
    helps: "AI video relighting tool that realistically changes lighting in existing footage",
    price: "Subscription",
    budgetFit: "both",
    link: "lumalabs.ai/ray",
    roles: ["Gaffer (Lighting)", "DOP (Director of Photography)"],
    shortDescription: "Relight any video shot with realistic AI lighting",
    howToUse: [
      "Step 1: Go to lumalabs.ai/ray and sign up",
      "Step 2: Upload your video clip",
      "Step 3: Describe the new lighting you want",
      "Step 4: Adjust intensity and direction",
      "Step 5: Export the relit video"
    ],
    examplePrompt: "Relight this night scene to look like it was shot during golden hour with soft practical lights"
  },
  {
    rank: 11,
    name: "Light Depth (Luminar Neo)",
    category: "Post-Prod",
    helps: "AI relighting and dramatic lighting enhancement for still frames and photo-based VFX",
    price: "Subscription",
    budgetFit: "both",
    link: "skylum.com",
    roles: ["Gaffer (Lighting)", "DOP (Director of Photography)"],
    shortDescription: "Powerful AI relighting for photos and VFX plates",
    howToUse: [
      "Step 1: Open Luminar Neo",
      "Step 2: Import your image or plate",
      "Step 3: Use Relight AI tool",
      "Step 4: Adjust light direction and intensity",
      "Step 5: Export the relit image"
    ],
    examplePrompt: "Relight this dark interior scene with dramatic window light coming from the left"
  },
  {
    rank: 12,
    name: "SuperScout.ai",
    category: "Pre-Prod",
    helps: "AI-powered location scouting with photo and availability suggestions for film shoots",
    price: "Subscription",
    budgetFit: "indie",
    link: "superscout.ai",
    roles: ["Location Manager"],
    shortDescription: "AI location scouting with real photos and availability",
    howToUse: [
      "Step 1: Go to superscout.ai and create an account",
      "Step 2: Describe the type of location you need",
      "Step 3: Review AI-suggested locations with photos",
      "Step 4: Check availability and contact info",
      "Step 5: Schedule a visit or book"
    ],
    examplePrompt: "Find abandoned warehouses in Los Angeles suitable for a horror film shoot"
  },
  {
    rank: 13,
    name: "Massif Network",
    category: "Pre-Prod",
    helps: "AI + VR hybrid location scouting platform for virtual pre-vis and real-world scouting",
    price: "Subscription",
    budgetFit: "both",
    link: "massif.network",
    roles: ["Location Manager", "Production Designer"],
    shortDescription: "VR + AI hybrid location scouting and pre-vis",
    howToUse: [
      "Step 1: Go to massif.network and sign up",
      "Step 2: Describe your location needs",
      "Step 3: Explore virtual tours of suggested locations",
      "Step 4: Save favorites and share with team",
      "Step 5: Contact real locations for scouting"
    ],
    examplePrompt: "Find a Victorian mansion for a period drama with good natural light"
  },
  {
    rank: 14,
    name: "Filmustage",
    category: "Pre-Prod",
    helps: "AI-powered script breakdown that automatically extracts scenes, characters, locations, props, and generates accurate budgets and shooting schedules",
    price: "from $29/mo",
    budgetFit: "both",
    link: "filmustage.com",
    roles: [
      "Producer / Line Producer",
      "Director",
      "1st Assistant Director",
      "Script Supervisor",
    ],
    shortDescription: "AI script breakdown and production scheduling",
    howToUse: [
      "Step 1: Go to filmustage.com and sign up",
      "Step 2: Upload your script",
      "Step 3: Let AI perform automatic breakdown",
      "Step 4: Review and edit scenes, characters, and locations",
      "Step 5: Generate budget and shooting schedule"
    ],
    examplePrompt: "Break down this 90-page thriller script and create a detailed shooting schedule"
  },
  {
    rank: 15,
    name: "Google Vids",
    category: "Post-Prod",
    helps: "AI-powered video editor for professional videos",
    price: "Subscription",
    budgetFit: "both",
    link: "workspace.google.com/products/vids",
    roles: ["Editor", "Production Coordinator"],
    shortDescription: "Simple AI video editor integrated with Google Workspace",
    howToUse: [
      "Step 1: Open Google Workspace and access Vids",
      "Step 2: Upload footage or start a new project",
      "Step 3: Use AI to suggest edits and transitions",
      "Step 4: Add voiceover or text with AI help",
      "Step 5: Export the final video"
    ],
    examplePrompt: "Turn this 45-minute meeting footage into a 3-minute summary video"
  },
  {
    rank: 16,
    name: "Kira",
    category: "Legal",
    helps: "AI contract analysis and due diligence",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "litera.com/products/kira",
    roles: ["Lawyer / Clearance"],
    shortDescription: "AI contract review and risk analysis for film production",
    howToUse: [
      "Step 1: Go to litera.com and access Kira",
      "Step 2: Upload your contract documents",
      "Step 3: Let AI analyze for risks and clauses",
      "Step 4: Review highlighted issues",
      "Step 5: Generate summary report"
    ],
    examplePrompt: "Analyze this location release form for potential legal risks"
  },
  {
    rank: 17,
    name: "Lexis+ AI",
    category: "Legal",
    helps: "Legal research, summarization, contract review",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "lexisnexis.com",
    roles: ["Lawyer / Clearance"],
    shortDescription: "AI-powered legal research and contract analysis",
    howToUse: [
      "Step 1: Log into Lexis+ AI",
      "Step 2: Ask questions or upload documents",
      "Step 3: Use AI to summarize case law or contracts",
      "Step 4: Review AI-generated insights",
      "Step 5: Export findings"
    ],
    examplePrompt: "Summarize recent case law on film clearance and intellectual property"
  },
  {
    rank: 18,
    name: "Nano Banana Pro",
    category: "Pre-Prod",
    helps: "High-quality image generation for concepts and storyboards",
    price: "Free with Google AI Studio",
    budgetFit: "indie",
    link: "gemini.google.com",
    roles: ["Production Designer", "Director", "Storyboard Artist"],
    shortDescription: "Fast, high-quality AI image generation using Google AI",
    howToUse: [
      "Step 1: Go to gemini.google.com",
      "Step 2: Use the image generation feature",
      "Step 3: Write a detailed prompt",
      "Step 4: Generate and refine variations",
      "Step 5: Download images for your storyboard"
    ],
    examplePrompt: "Cinematic wide shot of a lone cowboy riding through a desert at sunset, dramatic lighting, western style"
  },
  {
    rank: 19,
    name: "DaVinci Resolve AI",
    category: "Post-Prod",
    helps: "AI-powered color grading, editing, and audio tools in DaVinci Resolve",
    price: "Free / Studio version paid",
    budgetFit: "both",
    link: "blackmagicdesign.com",
    roles: ["Editor", "Colorist"],
    shortDescription: "Powerful AI features inside the industry-standard editing software",
    howToUse: [
      "Step 1: Open DaVinci Resolve",
      "Step 2: Import your footage",
      "Step 3: Use Magic Mask, Voice Isolation, or AI color tools",
      "Step 4: Refine with manual adjustments",
      "Step 5: Export the final project"
    ],
    examplePrompt: "Use AI to isolate and enhance dialogue in this noisy location audio"
  },
  {
    rank: 20,
    name: "Adobe Firefly",
    category: "Pre-Prod",
    helps: "Generative AI for image and video creation integrated with Adobe tools",
    price: "Subscription",
    budgetFit: "both",
    link: "adobe.com/firefly",
    roles: ["Production Designer", "Editor"],
    shortDescription: "Generative AI integrated directly into Adobe Photoshop and Premiere",
    howToUse: [
      "Step 1: Open Photoshop or Premiere with Firefly enabled",
      "Step 2: Use Generative Fill or Text to Image",
      "Step 3: Describe what you want to create or modify",
      "Step 4: Refine the generated content",
      "Step 5: Integrate into your project"
    ],
    examplePrompt: "Generate a cyberpunk city background for this character plate"
  },
  {
    rank: 21,
    name: "Kling AI 3.0",
    category: "Production",
    helps: "High-quality text-to-video generation",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "kling.ai",
    roles: ["Director", "Editor"],
    shortDescription: "High-quality text-to-video generation with excellent motion and realism",
    howToUse: [
      "Step 1: Go to kling.ai and create an account",
      "Step 2: Choose text-to-video mode",
      "Step 3: Write a detailed scene description",
      "Step 4: Adjust duration, motion strength, and aspect ratio",
      "Step 5: Generate and download the video"
    ],
    examplePrompt: "A lone warrior walking through a burning battlefield at dawn, epic cinematic style, slow motion"
  },
  {
    rank: 22,
    name: "Luma Dream Machine",
    category: "Production",
    helps: "Text-to-video and image-to-video generation",
    price: "Subscription",
    budgetFit: "both",
    link: "lumalabs.ai/dream-machine",
    roles: ["Director", "Editor"],
    shortDescription: "Creative text-to-video tool with strong motion and style control",
    howToUse: [
      "Step 1: Go to lumalabs.ai/dream-machine and sign up",
      "Step 2: Enter a text prompt or upload an image",
      "Step 3: Generate multiple variations",
      "Step 4: Extend or remix the best results",
      "Step 5: Download the video clips"
    ],
    examplePrompt: "A majestic dragon flying over ancient mountains at sunrise, epic fantasy style, cinematic camera movement"
  },
  {
    rank: 23,
    name: "Suno AI",
    category: "Post-Prod",
    helps: "AI music and song generation",
    price: "Subscription",
    budgetFit: "both",
    link: "suno.com",
    roles: ["Sound Designer"],
    shortDescription: "Fast AI music and full song generation with lyrics",
    howToUse: [
      "Step 1: Go to suno.com and create an account",
      "Step 2: Describe the style and mood of the music",
      "Step 3: Add lyrics if desired",
      "Step 4: Generate several versions",
      "Step 5: Download the audio tracks"
    ],
    examplePrompt: "Epic orchestral trailer music with intense strings and powerful drums, cinematic, dark tone"
  },
  {
    rank: 24,
    name: "Udio",
    category: "Post-Prod",
    helps: "AI music generation with high quality",
    price: "Subscription",
    budgetFit: "both",
    link: "udio.com",
    roles: ["Sound Designer"],
    shortDescription: "High-quality AI music generator with excellent vocal synthesis",
    howToUse: [
      "Step 1: Go to udio.com and sign up",
      "Step 2: Describe the genre and mood",
      "Step 3: Add custom lyrics if needed",
      "Step 4: Generate and compare versions",
      "Step 5: Download the best track"
    ],
    examplePrompt: "Emotional piano ballad with male vocals about loss and hope, cinematic film score style"
  },
  {
    rank: 25,
    name: "AIVA",
    category: "Post-Prod",
    helps: "AI music composition for film scores",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "aiva.ai",
    roles: ["Sound Designer", "Composer"],
    shortDescription: "AI composer specialized in cinematic film scores",
    howToUse: [
      "Step 1: Go to aiva.ai and create an account",
      "Step 2: Choose film score genre and mood",
      "Step 3: Set duration and instrumentation",
      "Step 4: Generate and refine the composition",
      "Step 5: Export as audio or MIDI"
    ],
    examplePrompt: "Dark, suspenseful orchestral score for a thriller chase scene, building tension"
  },
  {
    rank: 26,
    name: "Boords",
    category: "Pre-Prod",
    helps: "AI-assisted storyboarding tool",
    price: "Subscription",
    budgetFit: "indie",
    link: "boords.com",
    roles: ["Director", "Storyboard Artist"],
    shortDescription: "Simple and fast AI-assisted storyboarding platform",
    howToUse: [
      "Step 1: Go to boords.com and sign up",
      "Step 2: Create a new storyboard project",
      "Step 3: Use AI to generate frames from script",
      "Step 4: Edit drawings, add notes, and camera angles",
      "Step 5: Export as PDF or share with team"
    ],
    examplePrompt: "Create storyboard frames for a dialogue-heavy bar scene at night"
  },
  {
    rank: 27,
    name: "Katalist",
    category: "Pre-Prod",
    helps: "AI script breakdown and scheduling",
    price: "Subscription",
    budgetFit: "both",
    link: "katalist.ai",
    roles: ["Producer / Line Producer", "1st Assistant Director"],
    shortDescription: "AI script breakdown and production scheduling assistant",
    howToUse: [
      "Step 1: Go to katalist.ai and create an account",
      "Step 2: Upload your script",
      "Step 3: Let AI perform automatic breakdown",
      "Step 4: Review and edit scenes, characters, and locations",
      "Step 5: Generate budget and shooting schedule"
    ],
    examplePrompt: "Break down this 95-page thriller script and create a detailed shooting schedule"
  },
  {
    rank: 28,
    name: "Studiobinder",
    category: "Pre-Prod",
    helps: "Production management and script breakdown tools",
    price: "Subscription",
    budgetFit: "both",
    link: "studiobinder.com",
    roles: [
      "Producer / Line Producer",
      "Director",
      "Script Supervisor",
      "1st Assistant Director",
    ],
    shortDescription: "Comprehensive production management and script breakdown platform",
    howToUse: [
      "Step 1: Go to studiobinder.com and sign up",
      "Step 2: Create a new project and upload script",
      "Step 3: Use AI breakdown tools",
      "Step 4: Build shot lists, call sheets, and schedules",
      "Step 5: Collaborate with team and export documents"
    ],
    examplePrompt: "Create a full production bible for a 10-day short film shoot"
  },
  {
    rank: 29,
    name: "Celx AI",
    category: "Post-Prod",
    helps: "AI video editing and enhancement",
    price: "Subscription",
    budgetFit: "both",
    link: "celx.ai",
    roles: ["Editor"],
    shortDescription: "AI-assisted video editing and enhancement tool",
    howToUse: [
      "Step 1: Go to celx.ai and create an account",
      "Step 2: Upload your footage",
      "Step 3: Let AI suggest cuts and enhancements",
      "Step 4: Review and fine-tune the edit",
      "Step 5: Export the final video"
    ],
    examplePrompt: "Automatically edit this 30-minute raw interview into a tight 5-minute highlight reel"
  },
  {
    rank: 30,
    name: "Feiyu SCORP 2",
    category: "Production",
    helps: "AI-powered gimbal stabilization with cinematic modes",
    price: "Hardware + app",
    budgetFit: "both",
    link: "feiyu-tech.com",
    roles: [
      "Gaffer (Lighting)",
      "DOP (Director of Photography)",
      "Key Grip",
    ],
    shortDescription: "Smart gimbal with AI cinematic shooting modes",
    howToUse: [
      "Step 1: Set up the Feiyu SCORP 2 gimbal",
      "Step 2: Connect to the Feiyu ON app",
      "Step 3: Enable AI tracking or cinematic modes",
      "Step 4: Record smooth stabilized footage",
      "Step 5: Transfer footage to your editing computer"
    ],
    examplePrompt: "Use AI tracking to follow a running actor smoothly through a crowded market"
  },
  {
    rank: 31,
    name: "Style2D AI",
    category: "Pre-Prod",
    helps: "AI character and costume design",
    price: "Subscription",
    budgetFit: "both",
    link: "style2d.ai",
    roles: ["Costume Designer", "Production Designer"],
    shortDescription: "AI tool for generating character and costume designs",
    howToUse: [
      "Step 1: Go to style2d.ai and create an account",
      "Step 2: Describe the character, period, and style",
      "Step 3: Generate multiple design variations",
      "Step 4: Refine colors, details, and accessories",
      "Step 5: Export high-resolution images for production"
    ],
    examplePrompt: "Create a detailed cyberpunk hacker costume for a female lead character, dark tones with neon accents"
  },
  {
    rank: 32,
    name: "Browzwear",
    category: "Pre-Prod",
    helps: "AI 3D garment and costume visualization",
    price: "Enterprise",
    budgetFit: "hollywood",
    link: "browzwear.com",
    roles: ["Costume Designer"],
    shortDescription: "Professional 3D garment design and visualization software",
    howToUse: [
      "Step 1: Open Browzwear software",
      "Step 2: Create or import garment patterns",
      "Step 3: Apply fabrics and textures",
      "Step 4: Use AI to generate realistic 3D previews",
      "Step 5: Export for production and team review"
    ],
    examplePrompt: "Visualize a Victorian-era ball gown in silk with intricate lace details on a digital model"
  },
  {
    rank: 33,
    name: "NewArc",
    category: "Pre-Prod",
    helps: "AI set design and virtual production tools",
    price: "Subscription",
    budgetFit: "hollywood",
    link: "newarc.ai",
    roles: ["Production Designer"],
    shortDescription: "AI-assisted set design and virtual production environment",
    howToUse: [
      "Step 1: Go to newarc.ai and sign up",
      "Step 2: Describe the set or location needed",
      "Step 3: Generate 3D virtual set designs",
      "Step 4: Customize lighting, props, and layout",
      "Step 5: Export for Unreal Engine or pre-vis"
    ],
    examplePrompt: "Design a futuristic spaceship interior bridge with holographic displays"
  },
  {
    rank: 34,
    name: "Refabric",
    category: "Pre-Prod",
    helps: "AI fabric and material visualization",
    price: "Subscription",
    budgetFit: "both",
    link: "refabric.ai",
    roles: ["Costume Designer", "Production Designer"],
    shortDescription: "AI tool for realistic fabric and material visualization",
    howToUse: [
      "Step 1: Go to refabric.ai and create an account",
      "Step 2: Upload or describe fabric type",
      "Step 3: Apply to digital garment or set piece",
      "Step 4: Adjust lighting and movement simulation",
      "Step 5: Export high-quality renders"
    ],
    examplePrompt: "Visualize heavy velvet fabric with gold embroidery under dramatic theatrical lighting"
  },
  {
    rank: 35,
    name: "Yumdu",
    category: "Pre-Prod",
    helps: "AI production scheduling and crew management",
    price: "Subscription",
    budgetFit: "both",
    link: "yumdu.com",
    roles: ["Producer / Line Producer", "Production Coordinator"],
    shortDescription: "AI-powered production scheduling and crew coordination",
    howToUse: [
      "Step 1: Go to yumdu.com and sign up",
      "Step 2: Import script or project details",
      "Step 3: Let AI generate shooting schedule",
      "Step 4: Assign crew and resources",
      "Step 5: Share call sheets and updates with team"
    ],
    examplePrompt: "Create a 15-day shooting schedule for a 90-page drama with 12 actors"
  },
  {
    rank: 36,
    name: "Onbrand AI Design",
    category: "Pre-Prod",
    helps: "AI branding and marketing asset generation",
    price: "Subscription",
    budgetFit: "both",
    link: "onbrand.ai",
    roles: ["Production Designer"],
    shortDescription: "AI tool for generating marketing and branding assets",
    howToUse: [
      "Step 1: Go to onbrand.ai and create an account",
      "Step 2: Describe your film’s tone and style",
      "Step 3: Generate posters, social assets, and titles",
      "Step 4: Refine colors and typography",
      "Step 5: Export high-resolution assets"
    ],
    examplePrompt: "Create a minimalist festival poster for a psychological thriller"
  },
  {
    rank: 37,
    name: "Fashable",
    category: "Pre-Prod",
    helps: "AI fashion and costume generation",
    price: "Subscription",
    budgetFit: "both",
    link: "fashable.ai",
    roles: ["Costume Designer"],
    shortDescription: "AI fashion design tool specialized in costumes",
    howToUse: [
      "Step 1: Go to fashable.ai and sign up",
      "Step 2: Describe the character and period",
      "Step 3: Generate multiple costume options",
      "Step 4: Customize fabrics and details",
      "Step 5: Export designs for production"
    ],
    examplePrompt: "Generate 1920s flapper dresses with intricate beadwork for a jazz club scene"
  },
  {
    rank: 38,
    name: "Descript",
    category: "Post-Prod",
    helps: "Transcript-first video and podcast editing with Overdub, Studio Sound, filler-word removal, and multitrack timelines for fast assembly cuts",
    price: "from $12/mo (Free tier available)",
    budgetFit: "both",
    link: "descript.com",
    roles: ["Editor", "Sound Designer", "Production Coordinator"],
    shortDescription: "Edit video by editing text — ideal for rough cuts, ADR notes, and dialogue-heavy scenes",
    howToUse: [
      "Step 1: Import footage or record directly in Descript",
      "Step 2: Let Descript transcribe; cut and rearrange by deleting or moving text",
      "Step 3: Use Studio Sound to clean noisy location audio where safe",
      "Step 4: Add titles, captions, and simple graphics in the timeline",
      "Step 5: Export sequence or publish to review links for producers"
    ],
    examplePrompt: "Rough-cut this 18-minute interview down to 6 tight minutes, remove ums and long pauses, and flag lines that need ADR"
  },
  {
    rank: 39,
    name: "CapCut",
    category: "Post-Prod",
    helps: "Mobile and desktop editor with auto captions, beat-sync cuts, background removal, and AI templates for trailers and social cutdowns",
    price: "Free; Pro from ~$8/mo",
    budgetFit: "indie",
    link: "capcut.com",
    roles: ["Editor", "Production Coordinator", "Director"],
    shortDescription: "Fast AI-assisted edits for vertical teasers, BTS, and festival socials without a heavy NLE",
    howToUse: [
      "Step 1: Start a project and import dailies or graded masters",
      "Step 2: Generate auto captions and fix timing for dialogue clarity",
      "Step 3: Use beat sync or templates for promo pacing",
      "Step 4: Apply background cleanup or simple relight where available",
      "Step 5: Export platform-specific aspect ratios for Instagram and TikTok"
    ],
    examplePrompt: "60-second festival teaser from 4K interview + B-roll, punchy captions, end card with laurels"
  },
  {
    rank: 40,
    name: "Leonardo.ai",
    category: "Pre-Prod",
    helps: "Image generation with motion, character reference pipelines, and style-consistent boards for pitch decks and look development",
    price: "from $10/mo (Free tier available)",
    budgetFit: "both",
    link: "leonardo.ai",
    roles: ["Production Designer", "Director", "DOP (Director of Photography)"],
    shortDescription: "Cinematic stills and motion previews for mood boards when you need control beyond a single generalist model",
    howToUse: [
      "Step 1: Create a project and set aspect ratio to match your delivery frame",
      "Step 2: Upload reference stills for character or location consistency",
      "Step 3: Iterate prompts with negative prompts to reduce artifact hands and faces",
      "Step 4: Use motion or short clip modes for pre-vis beats where offered",
      "Step 5: Export PNG sequences or boards for the art department PDF"
    ],
    examplePrompt: "Neo-noir alley at blue hour, rain on cobblestones, lone detective in trench coat, 2.39:1, film grain, no text"
  },
  {
    rank: 41,
    name: "HeyGen",
    category: "Post-Prod",
    helps: "AI avatars, lip-sync translation, and talking-head video for pickups, explainers, and multilingual marketing without a reshoot",
    price: "from $24/mo (Free trial)",
    budgetFit: "both",
    link: "heygen.com",
    roles: ["Producer / Line Producer", "Editor", "Production Coordinator"],
    shortDescription: "Turn scripts into presenter-led video and localized dubs when cast cannot return to set",
    howToUse: [
      "Step 1: Choose an avatar or upload talent-approved likeness per clearance rules",
      "Step 2: Paste script lines and set pacing; preview lip sync",
      "Step 3: Translate voice and captions for festival or streaming territories",
      "Step 4: Brand with lower-thirds and logo safe areas",
      "Step 5: Export MP4 for EPK or distributor deliverables checklist"
    ],
    examplePrompt: "30-second director statement for a festival site, warm tone, English and Spanish voice tracks"
  },
  {
    rank: 42,
    name: "Synthesia",
    category: "Pre-Prod",
    helps: "Studio-style AI presenters and templated scenes for pitch videos, investor updates, and crew onboarding with brand-safe avatars",
    price: "from $22/mo (Trial)",
    budgetFit: "hollywood",
    link: "synthesia.io",
    roles: ["Producer / Line Producer", "Production Coordinator", "Lawyer / Clearance"],
    shortDescription: "Polished talking-head explainers when you need legal-approved avatars instead of unpaid cast pickups",
    howToUse: [
      "Step 1: Pick a template layout matching your aspect ratio",
      "Step 2: Write scene copy; split into short beats for natural cadence",
      "Step 3: Swap avatars and backgrounds to match brand guidelines",
      "Step 4: Add on-screen bullet points for budget or schedule walkthroughs",
      "Step 5: Export with subtitles burned in for review meetings"
    ],
    examplePrompt: "Two-minute investor deck walkthrough of a $1.2M indie slate, neutral office background, SRT captions"
  },
  {
    rank: 43,
    name: "OpusClip",
    category: "Post-Prod",
    helps: "Long-form to short-form AI that finds hooks, reframes faces, and adds captions for viral-style clips from interviews and panels",
    price: "from $9/mo (Free tier)",
    budgetFit: "indie",
    link: "opus.pro",
    affiliateLink: "https://www.opus.pro/?via=9f898c",
    roles: ["Editor", "Production Coordinator", "Producer / Line Producer"],
    shortDescription: "Repurpose premiere Q&As and podcasts into vertical clips without manual scrubbing every beat",
    howToUse: [
      "Step 1: Upload a long interview or panel recording",
      "Step 2: Let Opus suggest highlight moments; reorder by story priority",
      "Step 3: Tune hook text and caption style for readability on phones",
      "Step 4: Crop to 9:16 with smart face tracking for talking heads",
      "Step 5: Batch export for a week of festival social posts"
    ],
    examplePrompt: "From a 42-minute filmmaker Q&A, create 8 clips under 45s each with strong openers and burned-in captions"
  },
  {
    rank: 44,
    name: "InVideo AI",
    category: "Post-Prod",
    helps: "Script-to-video workflows with stock-aware scenes, AI voiceover, and template libraries for promos and crowdfunding videos",
    price: "from $15/mo (Free tier)",
    budgetFit: "both",
    link: "invideo.io",
    roles: ["Producer / Line Producer", "Editor", "Director"],
    shortDescription: "Ship a credible Kickstarter or festival trailer fast when you lack an in-house motion designer",
    howToUse: [
      "Step 1: Start from a trailer or explainer template close to your genre",
      "Step 2: Paste script; map beats to scenes and swap stock where needed",
      "Step 3: Generate AI voiceover or upload guide track for timing",
      "Step 4: Adjust color blocks and typography to match one-sheet branding",
      "Step 5: Export 1080p master plus vertical variants"
    ],
    examplePrompt: "90-second crowdfunding video for a sci-fi proof-of-concept, urgent tone, three reward tiers on screen"
  },
  {
    rank: 45,
    name: "PixVerse",
    category: "Production",
    helps: "Text and image-to-video with stylized motion control for fantasy, anime-influenced, and stylized B-roll that would be costly practically",
    price: "from $8/mo (Free tier)",
    budgetFit: "both",
    link: "pixverse.ai",
    roles: ["Director", "Editor", "DOP (Director of Photography)"],
    shortDescription: "Quick stylized motion plates for pitch reels and VFX previs when photorealism is not the goal",
    howToUse: [
      "Step 1: Sign in and pick duration and aspect ratio for your plate",
      "Step 2: Write a motion-heavy prompt with camera verbs (dolly, pan, orbit)",
      "Step 3: Seed from a keyframe still if you have concept art",
      "Step 4: Generate variants; pick the least artifact-heavy pass",
      "Step 5: Download and comp over temp audio in your NLE"
    ],
    examplePrompt: "Orbiting shot around a floating island city at sunset, painterly style, slow parallax, no logos"
  },
  {
    rank: 46,
    name: "Hedra",
    category: "Production",
    helps: "Character-centric video from images and audio with expressive faces — useful for stylized dialogue plates and creature mouth movement tests",
    price: "from $10/mo (Free tier)",
    budgetFit: "both",
    link: "hedra.com",
    roles: ["Director", "Editor", "Sound Designer"],
    shortDescription: "Animate a still or simple rig toward lip-sync when you need a cheap blocking pass before VFX",
    howToUse: [
      "Step 1: Upload a clean frontal or three-quarter reference image",
      "Step 2: Add or generate audio aligned to line reads",
      "Step 3: Preview facial motion; reduce intensity if uncanny",
      "Step 4: Iterate on lighting cues in the prompt if supported",
      "Step 5: Export clip for editorial temp or pitch-only use (check likeness rights)"
    ],
    examplePrompt: "Portrait of an elderly inventor in his workshop speaks a 12-second monologue, warm practicals, subtle head motion"
  },
  {
    rank: 47,
    name: "Mubert",
    category: "Post-Prod",
    helps: "Generative and loopable royalty-aware music beds for edits, mood tests, and temp scores before composer spotting",
    price: "from $14/mo (Free tier)",
    budgetFit: "indie",
    link: "mubert.com",
    roles: ["Sound Designer", "Editor", "Director"],
    shortDescription: "Infinite-ish stems tuned by mood and BPM so editors can cut without fighting a fixed master",
    howToUse: [
      "Step 1: Choose genre, energy, and length to match scene duration",
      "Step 2: Generate several seeds; favorite the closest emotional fit",
      "Step 3: Export WAV or stems if the plan allows for light mixing",
      "Step 4: Drop under picture; note temp vs licensed final in EDL comments",
      "Step 5: Replace with composer final before distribution"
    ],
    examplePrompt: "Tense 2-minute underscore for a midnight stakeout, low sub pulse, no drums, 90 BPM, minor key"
  },
  {
    rank: 48,
    name: "Beatoven.ai",
    category: "Post-Prod",
    helps: "AI scoring with section-based dynamics for YouTube-ready beds, documentary cues, and mood shifts without manual MIDI programming",
    price: "from $10/mo (Free tier)",
    budgetFit: "indie",
    link: "beatoven.ai",
    roles: ["Sound Designer", "Editor", "Director"],
    shortDescription: "Region-based intensity changes for doc scenes that breathe between interview and vérité",
    howToUse: [
      "Step 1: Set project length to match timeline gap",
      "Step 2: Pick genre pack closest to your sonic palette",
      "Step 3: Add emotion ramps at scene boundaries",
      "Step 4: Preview against picture in your DAW or NLE",
      "Step 5: Export licensed WAV and archive the license receipt"
    ],
    examplePrompt: "Documentary cue: hopeful strings building over 90s into a restrained climax when the subject wins the appeal"
  },
  {
    rank: 49,
    name: "Soundraw",
    category: "Post-Prod",
    helps: "Mood, genre, and instrument sliders for custom-length royalty-friendly tracks suited to recurring series or tight indie schedules",
    price: "from $17/mo",
    budgetFit: "both",
    link: "soundraw.io",
    roles: ["Sound Designer", "Editor", "Producer / Line Producer"],
    shortDescription: "Dial in instrumentation when you need repeatable sonic branding across episodes or campaign cuts",
    howToUse: [
      "Step 1: Select length to match cut duration exactly",
      "Step 2: Lock key instruments you want present or absent",
      "Step 3: Generate alternatives; star the closest to reference track",
      "Step 4: Adjust energy curve for act breaks",
      "Step 5: Export full mix and keep project file for recuts"
    ],
    examplePrompt: "Dark synthwave bed for a 2.5-minute chase, no vocals, rising percussion in final 30 seconds"
  },
  {
    rank: 50,
    name: "Magnific AI",
    category: "Post-Prod",
    helps: "Generative upscaling and detail enhancement for stills and plates — useful for poster blowups and soft VFX still enlargement when resolution is short",
    price: "from $39/mo",
    budgetFit: "hollywood",
    link: "magnific.ai",
    roles: ["Editor", "Production Designer", "DOP (Director of Photography)"],
    shortDescription: "Creative upscale with texture control for key art and texture-critical restoration previews",
    howToUse: [
      "Step 1: Upload highest-quality still or extracted frame",
      "Step 2: Choose target resolution and creativity slider conservatively for faces",
      "Step 3: Run preview tiles before full render to catch hallucinations",
      "Step 4: Compare against Topaz-style conservative pass if you need fidelity",
      "Step 5: Export TIFF for print or PNG for motion plate import"
    ],
    examplePrompt: "Upscale a 2K anamorphic still to print-ready 24x36 poster, preserve skin texture, minimal hallucinated jewelry"
  },
  {
    rank: 51,
    name: "Scriptation",
    category: "Production",
    helps: "Digital script-lining, facing pages, and note transfer across PDF revisions — built for script supervisors marking coverage, props, and continuity on iPad and Mac",
    price: "from $13/mo (Free trial)",
    budgetFit: "both",
    link: "scriptation.com",
    roles: ["Script Supervisor", "Editor", "Director"],
    shortDescription: "Industry-standard markup and revision sync so continuity notes survive new script drops without retyping",
    howToUse: [
      "Step 1: Import the production PDF or Final Draft export",
      "Step 2: Use lining layers for coverage, eyelines, and circle takes",
      "Step 3: Photo-link wardrobe or set continuity into script pages",
      "Step 4: When a new draft arrives, migrate annotations with Scriptation’s transfer tools",
      "Step 5: Export facing pages or reports for editorial and production office"
    ],
    examplePrompt: "Mark Scene 42 for 2:1 coverage, flag a wardrobe watch on the hero’s watch band, and prep editor-facing notes for the director’s cut"
  },
  {
    rank: 52,
    name: "Studiovity",
    category: "Pre-Prod",
    helps: "Cloud pre-production suite with AI-assisted breakdowns, stripboards, shot lists, and call-sheet prep tied into scheduling exports",
    price: "from $19/mo (Free tier)",
    budgetFit: "both",
    link: "studiovity.com",
    roles: ["Script Supervisor", "1st Assistant Director", "Producer / Line Producer"],
    shortDescription: "Keeps breakdown tags, stripboard order, and department-facing reports aligned before the first production meeting",
    howToUse: [
      "Step 1: Upload script and run AI breakdown for cast, props, wardrobe, and locations",
      "Step 2: Review and correct tags with the script supervisor before locking",
      "Step 3: Generate stripboard drafts from scene order and company moves",
      "Step 4: Export elements lists for departments and attach to shared drive",
      "Step 5: Push schedule revisions when pages are cut or scenes combine"
    ],
    examplePrompt: "Rebuild the stripboard after combining Night INT. warehouse scenes 12–14 and regenerate department element lists"
  },
  {
    rank: 53,
    name: "Rivet AI",
    category: "Pre-Prod",
    helps: "AI script breakdowns, schedule drafts, and budget estimates from screenplay text — aimed at line producers validating scope before locking Movie Magic",
    price: "from $49/mo (Trial)",
    budgetFit: "hollywood",
    link: "rivetai.com",
    roles: ["Script Supervisor", "Producer / Line Producer", "1st Assistant Director"],
    shortDescription: "Stress-test page counts and company moves early so script sup notes and AD stripboards do not fight the budget reality",
    howToUse: [
      "Step 1: Import script and generate automated element extraction",
      "Step 2: Compare AI day-out-of-days against the script supervisor’s continuity flags",
      "Step 3: Adjust turnaround assumptions for child or animal rules",
      "Step 4: Export schedule assumptions to share with UPM and HoD meetings",
      "Step 5: Re-run when major rewrite drops to re-baseline shoot length"
    ],
    examplePrompt: "Estimate shoot days for a 108-page ensemble drama with dual units and highlight where split days strain continuity coverage"
  },
  {
    rank: 54,
    name: "SetHero",
    category: "Production",
    helps: "Digital call sheets, crew confirmations, and distro lists with weather, hospitals, and nearest parking — reduces morning confusion for grip trucks and splinter units",
    price: "from $15/mo (Free trial)",
    budgetFit: "both",
    link: "sethero.com",
    roles: ["Key Grip", "1st Assistant Director", "Production Coordinator"],
    shortDescription: "Key grips see rigging call times, basecamp maps, and safety notes on mobile before the truck pack is finalized",
    howToUse: [
      "Step 1: Build call sheet from schedule import or template",
      "Step 2: Add parking pins, crane base zones, and tech-scout photos for grip parking",
      "Step 3: Push distro to department heads and confirm read receipts",
      "Step 4: Update weather and hospital block for remote locations",
      "Step 5: Archive day’s PDF for insurance and union time paperwork"
    ],
    examplePrompt: "Crane day on Stage 4: add 6am rigging crew call, map C-stand staging lane, and attach lensing PDF for the gaffer team"
  },
  {
    rank: 55,
    name: "Cheqroom",
    category: "Production",
    helps: "Equipment reservation, checkout QR codes, and maintenance logs for dollies, cranes, and grip packages across prep and shoot weeks",
    price: "from $29/mo (Free tier)",
    budgetFit: "both",
    link: "cheqroom.com",
    roles: ["Key Grip", "Production Coordinator", "Producer / Line Producer"],
    shortDescription: "Tracks which grip package left the prep dock and when it must return so splinter units do not double-book the Fisher dolly",
    howToUse: [
      "Step 1: Catalog cranes, dollies, and consumable kits with photos and serials",
      "Step 2: Reserve gear to shoot dates and assign responsible best boy or key grip",
      "Step 3: Scan check-out at load-out; scan check-in after wrap",
      "Step 4: Flag damaged hardware with photo evidence for rental house claims",
      "Step 5: Export month-end utilization for rental vs owned ROI"
    ],
    examplePrompt: "Reserve 12x12 solids and a PeeWee for Unit B next Tuesday and alert if the package conflicts with the commercial prep hold"
  },
];

/** Stable join key between `allTools` and workflow / budget presets (unique per tool). */
export function getToolByRank(rank: number): Tool | undefined {
  return allTools.find((t) => t.rank === rank);
}

/** Default line items for Budget Templates — derived from catalog so renames/prices stay in sync. */
export const BUDGET_DEFAULT_MICRO_ROWS = [
  { rank: 1, qty: 1 },
  { rank: 3, qty: 1 },
  { rank: 4, qty: 1 },
  { rank: 5, qty: 1 },
  { rank: 6, qty: 1 },
  { rank: 12, qty: 1 },
  { rank: 51, qty: 1 },
  { rank: 54, qty: 1 },
] as const;

export const BUDGET_DEFAULT_LOW_ROWS = [
  { rank: 1, qty: 2 },
  { rank: 2, qty: 1 },
  { rank: 3, qty: 2 },
  { rank: 7, qty: 1 },
  { rank: 8, qty: 1 },
  { rank: 9, qty: 1 },
  { rank: 52, qty: 1 },
  { rank: 53, qty: 1 },
  { rank: 54, qty: 1 },
  { rank: 55, qty: 1 },
] as const;

function parseMonthlyFromPrice(price: string): number {
  const m = price.match(/\d+/);
  return m ? parseFloat(m[0]) : 15;
}

/** Row shape used by Budget Templates state in `page.tsx` (includes `catalogRank` for kit-style sync). */
export function budgetLineFromCatalogTool(tool: Tool, qty: number) {
  return {
    ...tool,
    catalogRank: tool.rank,
    qty,
    monthly: parseMonthlyFromPrice(tool.price),
  };
}

export function budgetLinesFromPreset(
  rows: readonly { readonly rank: number; readonly qty: number }[]
) {
  const out: ReturnType<typeof budgetLineFromCatalogTool>[] = [];
  for (const { rank, qty } of rows) {
    const t = getToolByRank(rank);
    if (!t) continue;
    out.push(budgetLineFromCatalogTool(t, qty));
  }
  return out;
}

export const workflowStages = [
  {
    title: "Pre-Production",
    description: "4–12 weeks: Turn your idea into a shoot-ready plan",
    steps: [
      { 
        step: "1.1 Idea Development & Scripting", 
        description: "Refine concept, write/rewrite script, create treatment.", 
        tools: [1, 4],
        proTip: "Write your first draft fast, then use AI to punch up dialogue and tighten pacing. Save at least 2–3 weeks compared to traditional rewriting."
      },
      { 
        step: "1.2 Storyboarding & Visualization", 
        description: "Create visual references and shot lists.", 
        tools: [6, 18],
        proTip: "Create 3 versions of key scenes (different moods/lenses) to help your DOP understand your vision before shooting."
      },
      { 
        step: "1.3 Casting & Talent", 
        description: "Breakdown roles, hold auditions, negotiate contracts.", 
        tools: [6, 52],
        proTip: "Generate visual character references before casting calls. Actors respond much better when they can see the look you're going for."
      },
      { 
        step: "1.4 Location Scouting & Permits", 
        description: "Find, photograph, and secure locations + permits.", 
        tools: [12],
        proTip: "Always scout at the same time of day you plan to shoot. Lighting changes everything."
      },
      { 
        step: "1.5 Production Design, Props & Costume", 
        description: "Design sets, source props, plan wardrobe.", 
        tools: [6, 18],
        proTip: "Create a shared mood board early. It saves hours of back-and-forth with your production designer and costume department."
      },
      { 
        step: "1.6 Makeup & Hair Planning", 
        description: "Design looks, test products, create continuity references.", 
        tools: [6, 51],
        proTip: "Take reference photos of actors in different lighting conditions. Continuity errors in makeup are very expensive to fix in post."
      },
      { 
        step: "1.7 Budgeting, Scheduling & Crew", 
        description: "Build detailed budget, shooting schedule, and assemble crew.", 
        tools: [1, 14, 52, 53],
        proTip: "Use visual references from Higgsfield to show your crew exactly what you're aiming for. This reduces misunderstandings and wasted shoot days."
      }
    ]
  },
  {
    title: "Production",
    description: "Principal photography: Capture the footage efficiently",
    steps: [
      { 
        step: "2.1 Shooting & Cinematic Look", 
        description: "Apply filmic profiles on set or in-camera.", 
        tools: [1, 2],
        proTip: "Test your look on the first day with a few test shots. Adjusting later in post is much more time-consuming."
      },
      { 
        step: "2.2 On-set Creative Support", 
        description: "Generate quick VFX previews and reference clips.", 
        tools: [2, 5],
        proTip: "Use quick AI previews to show your DOP or actors what a shot could look like with VFX. It helps everyone stay aligned on set."
      },
      { 
        step: "2.3 Lighting, Grip & Camera", 
        description: "Execute lighting design and camera movement.", 
        tools: [1, 54, 55],
        proTip: "Create a simple lighting reference reel the night before. Your gaffer and key grip will thank you."
      },
      { 
        step: "2.4 Sound Recording", 
        description: "Capture clean production audio.", 
        tools: [],
        proTip: "Always record room tone for every location. Clean audio saves huge amounts of time and money in post-production."
      },
      { 
        step: "2.5 Makeup, Costume & Continuity", 
        description: "Daily application and matching shots.", 
        tools: [6, 51],
        proTip: "Take a quick photo of every actor’s look at the beginning of each shooting day. Continuity mistakes are very hard to fix later."
      }
    ]
  },
  {
    title: "Post-Production",
    description: "4–12 weeks: Shape raw footage into the final film",
    steps: [
      { 
        step: "3.1 Editing & Assembly", 
        description: "Rough cut → Director’s cut.", 
        tools: [15, 7, 51],
        proTip: "Do your first assembly cut without music. Let the story breathe before adding emotional layers."
      },
      { 
        step: "3.2 Visual Effects & Enhancement", 
        description: "Add VFX, clean plates, upscale.", 
        tools: [2, 8, 9],
        proTip: "Fix simple VFX (sky replacement, clean-up) early. The longer you wait, the more expensive it becomes."
      },
      { 
        step: "3.3 Sound Design & Dubbing", 
        description: "Foley, ADR, voiceovers, multi-language dubbing.", 
        tools: [3],
        proTip: "Record ADR while the actor still remembers the scene emotionally. It sounds much more natural."
      },
      { 
        step: "3.4 Color Grading", 
        description: "Final look and mood.", 
        tools: [1],
        proTip: "Grade your film in sections (day scenes, night scenes, interiors). Consistent mood is more important than perfect perfection."
      }
    ]
  },
  {
    title: "Distribution & Marketing",
    description: "Get your film seen and monetized",
    steps: [
      { 
        step: "4.1 Marketing Assets", 
        description: "Trailers, posters, social clips, behind-the-scenes.", 
        tools: [2, 6, 5],
        proTip: "Make your trailer first — it will help you understand what your film is really about."
      },
      { 
        step: "4.2 Localization & Dubbing", 
        description: "Dub into other languages for global reach.", 
        tools: [3],
        proTip: "Start with Spanish and Mandarin if you're aiming for festivals and streaming platforms."
      },
      { 
        step: "4.3 Audience Targeting & Release", 
        description: "Festival strategy, platform optimization, metadata.", 
        tools: [6, 2],
        proTip: "Create different poster versions for different platforms (festivals vs Instagram vs Netflix-style)."
      }
    ]
  }
];

for (const stage of workflowStages) {
  for (const step of stage.steps) {
    for (const rank of step.tools) {
      if (!getToolByRank(rank)) {
        console.warn(
          `[data] workflow step "${step.step}" references unknown catalog rank ${rank}`
        );
      }
    }
  }
}

/** Merge saved My Kit JSON with the current catalog (by `catalogRank`, then by `name`). */
export function rehydrateKitEntry(entry: unknown): unknown {
  if (!entry || typeof entry !== "object") return entry;
  const e = entry as Record<string, unknown>;
  const rank =
    typeof e.catalogRank === "number" && Number.isFinite(e.catalogRank)
      ? e.catalogRank
      : undefined;
  const name = typeof e.name === "string" ? e.name : "";
  const t =
    rank != null ? getToolByRank(rank) : allTools.find((x) => x.name === name);
  if (!t) return entry;
  const qty =
    typeof e.qty === "number" && Number.isFinite(e.qty) && e.qty > 0
      ? Math.floor(e.qty)
      : 1;
  return {
    ...t,
    catalogRank: t.rank,
    qty,
    monthly: parseMonthlyFromPrice(t.price),
  };
}

export const SITE_CONTACT_EMAIL = "otherprojectsx@gmail.com" as const;

/** Linked from Budget Templates — must be shared so “Anyone with the link” can view for export URLs to work without sign-in. */
export const BUDGET_TEMPLATE_SHEETS = {
  micro: {
    id: "1xO5LM1eHio8rS8O1SGf4WF1EXYc7YhJO5QnPSjLXxWQ",
    editUrl:
      "https://docs.google.com/spreadsheets/d/1xO5LM1eHio8rS8O1SGf4WF1EXYc7YhJO5QnPSjLXxWQ/edit?usp=sharing",
  },
  low: {
    id: "1L9iFnldMosGjrNRwOzhVN8nYhUwg5BL7zDngWKpRpQs",
    editUrl:
      "https://docs.google.com/spreadsheets/d/1L9iFnldMosGjrNRwOzhVN8nYhUwg5BL7zDngWKpRpQs/edit?usp=sharing",
  },
} as const;

/** Direct download (new tab). Works on mobile when the spreadsheet is publicly viewable. */
export function googleSpreadsheetExportUrl(
  spreadsheetId: string,
  format: "xlsx" | "pdf" = "xlsx"
): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=${format}`;
}
