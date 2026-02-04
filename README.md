# Personal Portfolio + Visualization Project

This website is a personal portfolio that showcases my background, skills, and experience as a UX designer, along with a dedicated visualization page that explores data visualization and creative SVG art using JavaScript.

The project was created as part of an assignment focused on combining HTML, CSS, JavaScript, and SVG to build interactive visual content.

---

## Pages

### 1. Portfolio (`index.html`)
The main portfolio page introduces who I am and highlights my education, skills, experience, and contact information.  
It serves as the main home page of my website and navigation to my visualizations page.

### 2. Visualizations (`visualizations.html`)
This page contains two JavaScript-generated SVG experiences:

#### Data Visualization
- A **16-week marathon training plan** showing weekly running distance.
- Implemented as an **SVG bar chart generated entirely with JavaScript**.
- Users can switch between **kilometers and miles**.
- Visual encoding highlights key training phases such as cutback weeks, peak week, taper, and race week.
- Hello Kitty image is a PNG asset.

#### Creative SVG Art
- An interactive scene where **Hello Kitty eats strawberries**.
- Hello Kitty follows the user’s mouse movement.
- Strawberries spawn dynamically and are “eaten” when Hello Kitty gets close.
- The scene is rendered inside an **SVG element**, with **PNG assets embedded using SVG `<image>` elements**.
- All motion, interaction, collision detection, and animation are handled with JavaScript.

---

## Technologies Used

- **HTML** – Page structure and content
- **CSS** – Layout, typography, and visual styling
- **JavaScript** – Interactivity, data-driven rendering, animation, and state management
- **SVG** – Vector-based visualization and interactive art
- **PNG assets** – Custom visual assets designed in Figma and embedded within SVG elements

---

## File Structure

index.html # Main portfolio page
visualizations.html # Visualization and interactive art page
style.css # Shared styling for the site
main.js # Page-level JavaScript and event handling
vis.js # SVG visualization and creative art logic
assets/ # Images and visual assets (PNG files)


---

## Navigation

- Users can navigate from the portfolio page to the visualization page via a link in the “More Work” section.
- A **“Back to Portfolio”** link is provided on the visualization page for easy navigation back to the main site.

---

## Design Notes

- PNG assets were intentionally used for character and background artwork to allow for higher visual fidelity and efficient iteration in Figma. Designed in Figma.
- All PNGs are embedded inside SVG elements to maintain SVG-based rendering and interaction.
- The focus of the project is on interaction design, data representation, and motion rather than hand-drawing complex vector shapes.

---

