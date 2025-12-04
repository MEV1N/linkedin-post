# Zero to Maker Participation Card Generator

A Next.js web application for generating personalized participation cards for the "Zero to Maker" event by Tinkerhub MBCCET. Users can upload their photo, crop it, and generate a branded card with a custom frame overlay.

## 🚀 Features

### 1. **Photo Upload & Management**
- Upload profile photos in any standard image format
- Real-time preview of uploaded images
- Support for both desktop and mobile devices

### 2. **Advanced Image Cropping**
- Interactive canvas-based cropping tool
- Drag to reposition the crop area
- Resize handle for adjusting crop size
- Rule of thirds grid overlay for better composition
- Touch-friendly controls for mobile devices
- Reset functionality to restore default crop settings
- Option to skip cropping and use the full image

### 3. **Card Generation**
- Generates a high-quality participation card (1080x1350 pixels)
- Overlays a custom frame (`frame.png`) on the uploaded image
- Precise positioning: uploaded image fills the white space area (604x604 pixels)
- White space positioned at coordinates: X: 238px, Y: 373px
- Professional output suitable for social media sharing

### 4. **Download & Share**
- One-click download of generated card as PNG
- Pre-written LinkedIn post text for easy sharing
- Copy-to-clipboard functionality for the LinkedIn post
- Toast notifications for user feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.7 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Themes**: next-themes for dark/light mode support
- **Toast Notifications**: Sonner

## 📦 Dependencies

### Core Dependencies
- `next`: ^15.5.7
- `react`: ^19
- `react-dom`: ^19
- `typescript`: ^5

### UI & Styling
- `tailwindcss`: ^4.1.9
- `tailwindcss-animate`: ^1.0.7
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^2.5.5

### Radix UI Components
- `@radix-ui/react-label`
- `@radix-ui/react-toast`
- `@radix-ui/react-slot`
- Multiple other Radix UI primitives for robust UI components

### Utilities
- `lucide-react`: ^0.454.0 (Icons)
- `sonner`: ^1.7.4 (Toast notifications)
- `next-themes`: ^0.4.6 (Theme management)

## 🗂️ Project Structure

```
linkedin-post/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main page (Card Generator)
├── components/
│   ├── theme-provider.tsx   # Theme context provider
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── use-mobile.ts        # Mobile detection hook
│   └── use-toast.ts         # Toast notification hook
├── lib/
│   └── utils.ts             # Utility functions
├── public/
│   └── frame.png            # Card frame overlay (1080x1350)
├── components.json          # shadcn/ui configuration
├── next.config.mjs          # Next.js configuration
├── package.json             # Project dependencies
├── postcss.config.mjs       # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 🎨 Application Flow

### Step 1: Upload Photo
1. User clicks "Upload Photo" button
2. File picker opens for image selection
3. Image is loaded and displayed in the crop editor

### Step 2: Crop Image (Optional)
1. Interactive canvas displays the uploaded image
2. User can drag the crop area to reposition
3. User can resize by dragging the corner handle
4. Grid overlay helps with composition
5. Options to "Apply Crop" or "Skip Cropping"
6. Reset button available to restore defaults

### Step 3: Generate Card
1. User clicks "Generate Participation Card"
2. System creates a 1080x1350 canvas
3. Frame image (`frame.png`) is drawn as background
4. Cropped photo is positioned at (238, 373) with size 604x604
5. Final card is generated and displayed

### Step 4: Download & Share
1. Preview of generated card is shown
2. Download button saves card as PNG
3. LinkedIn post text is provided
4. Copy button for quick clipboard access

## 🖼️ Canvas Specifications

### Output Canvas
- **Dimensions**: 1080 x 1350 pixels (4:5 aspect ratio)
- **Format**: PNG with transparency support

### Photo Placement
- **Size**: 604 x 604 pixels (square)
- **Position**: 
  - X: 238 pixels from left
  - Y: 373 pixels from top
- **Purpose**: Fills the white space in the center of the frame

### Crop Canvas
- **Responsive**: Adapts to screen size (max 400px width)
- **Aspect Ratio**: 4:3 for preview
- **Features**: Draggable, resizable with grid overlay

## 🎯 Key Features Explained

### State Management
The application uses React hooks for state management:
- `photo`: Stores the uploaded file
- `photoPreview`: Base64 preview of uploaded image
- `croppedPhoto`: Cropped version ready for card generation
- `showCropper`: Toggle for crop interface
- `generatedCard`: Final card image data URL
- `cropPosition`: X/Y coordinates of crop area
- `cropSize`: Dimensions of crop area
- `isDragging`/`isResizing`: Interaction states

### Canvas Operations
- **drawCropPreview()**: Renders the crop interface with overlay and grid
- **applyCrop()**: Extracts the selected area from the original image
- **generateCard()**: Composites the frame and cropped photo
- **drawStars()**: Legacy function (currently unused)
- **drawConfetti()**: Legacy function (currently unused)

### User Experience
- Toast notifications for all major actions
- Disabled states for buttons when prerequisites aren't met
- Responsive design for mobile and desktop
- Touch-friendly controls with proper event handling
- Visual feedback during interactions

## 📱 Responsive Design

- Mobile-optimized touch controls
- Responsive canvas sizing
- Flexible button layouts (stacks on mobile)
- Maximum container width of 4xl (896px)
- Touch-action prevention during crop manipulation

## 🎭 LinkedIn Integration

Pre-configured post text:
```
I attended Zero to Maker by Tinkerhub and I would like to share a small experience from it. It was an amazing journey of learning, building, and connecting with like-minded makers! 🚀 #Tinkerhub #ZeroToMaker #MBCCET
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (preferred) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd linkedin-post

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🎨 Styling

The project uses Tailwind CSS with custom configuration:
- Gradient backgrounds (yellow-50 to orange-100)
- Custom card styling with shadows
- Responsive spacing and sizing
- Animation support via tailwindcss-animate

## 🖼️ Assets Required

### frame.png
- **Location**: `/public/frame.png`
- **Dimensions**: 1080 x 1350 pixels
- **Purpose**: Overlay frame for participation cards
- **White Space**: 604 x 604 pixel area at position (238, 373)

## 🔧 Configuration Files

- **next.config.mjs**: Next.js configuration
- **tsconfig.json**: TypeScript compiler options
- **postcss.config.mjs**: PostCSS plugins configuration
- **components.json**: shadcn/ui component configuration
- **tailwind.config**: Embedded in postcss.config or separate file

## 🐛 Error Handling

- Clipboard API fallback with error messages
- Canvas context validation
- Image load error handling
- Toast notifications for user feedback
- Proper state cleanup on errors

## 🌐 Browser Compatibility

- Modern browsers with Canvas API support
- Clipboard API for copy functionality
- FileReader API for image upload
- Touch events for mobile devices

## 📄 License

This project is private and intended for Tinkerhub MBCCET events.

## 👥 Authors

Created for Zero to Maker by Tinkerhub MBCCET

## 🤝 Contributing

This is an event-specific project. For modifications or improvements, please contact the project maintainer.

---

**Note**: Ensure `frame.png` is properly placed in the `/public` directory with correct dimensions (1080x1350) before deploying the application.
