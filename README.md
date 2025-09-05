
  

# Pokemon Invasion Chrome Extension

  

  

Transform any website into your personal Pokemon hunting ground! This Chrome extension spawns Pokemon from all generations on any webpage, complete with an interactive Pokemon GO-style catching mini-game and persistent collection system.

  

  

![Pokemon Invasion Demo](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-2.0-blue) ![Chrome Extension](https://img.shields.io/badge/platform-Chrome-yellow)

  
![enter image description here](https://ivanr3d.com/assets/img/screenshots/pokeinvasion.gif)
  

## Features

  

  

-  **Universal Pokemon Spawning**: Works on any website - social media, news sites, anywhere!

  

-  **Interactive Catching Game**: Pokemon GO-inspired swipe-to-throw mechanics

  

-  **Complete Pokedex**: Track all caught Pokemon with detailed stats and type information

  

-  **Generation Selection**: Choose from 8 Pokemon generations (898+ Pokemon total)

  

-  **Persistent Collection**: Your Pokemon are saved forever in Chrome storage

  

-  **Stats**: Track completion percentage and collection progress

  

## 🎮 How It Works

  

  

1.  **Activate Extension**: Click the Pokeball icon in your Chrome toolbar

  

2.  **Choose Generation**: Select which Pokemon generation to hunt (Gen I-VIII)

  

3.  **Start Invasion**: Pokemon begin appearing on any website you visit

  

4.  **Catch Pokemon**: Click on Pokemon to open the catching mini-game

  

5.  **Master the Throw**: Swipe the Pokeball toward the Pokemon with perfect timing

  

6.  **Build Collection**: View your growing Pokedex with detailed Pokemon information

  

  

## Installation

  

  

### Method 1: Chrome Web Store (Coming Soon)

  

*This extension will be available on the Chrome Web Store soon!*

  

  

### Method 2: Developer Installation

  

  

1.  **Download**: Clone or download this repository

  

```bash

  

git  clone  https://github.com/yourusername/pokemon-invasion-extension.git

  

```

  

  

2.  **Enable Developer Mode**:

  

- Open Chrome and navigate to `chrome://extensions/`

  

- Toggle "Developer mode" in the top right corner

  

  

3.  **Load Extension**:

  

- Click "Load unpacked"

  

- Select the downloaded folder

  

- The Pokemon Invasion icon should appear in your toolbar!

  

  

## Project Structure

  

  

```

  

poke-invasion-extension/

  

├── manifest.json # Extension configuration

  

├── popup.html # Extension popup interface

  

├── collection.html # Pokedex collection viewer

  

├── catch.html # Pokemon catching mini-game

  

├── js/

  

│ ├── content.js # Main content script

  

│ ├── pokemon-service.js # Pokemon data service

  

│ ├── popup.js # Popup functionality

  

│ ├── collection.js # Collection management

  

│ ├── catch.js # Catching game logic

  

│ └── anime.min.js # Animation library

  

└── icons/

  

├── icon16.png # 16x16 extension icon

  

├── icon32.png # 32x32 extension icon

  

├── icon48.png # 48x48 extension icon

  

└── icon128.png # 128x128 extension icon

  

```

  

  

## Usage Guide

  

  

### Starting Your Pokemon Adventure

  

1. Navigate to any website (news sites, social media, blogs - anywhere!)

  

2. Click the Pokemon Invasion extension icon

  

3. Select your preferred Pokemon generation

  

4. Click "🚀 Start Pokemon Invasion"

  

5. Watch as Pokemon begin appearing from the edges of your screen!

  
  

### Managing Your Collection

  

-  **View Pokedex**: Click the 📱 button to see all caught Pokemon

  

-  **Filter & Sort**: Organize by generation, rarity, name, or date caught

  

-  **Track Progress**: Monitor your completion percentage across all generations

  

-  **Export Data**: Backup your collection data

  

  

## Technical Details

  

  

### Technologies Used

  

-  **Manifest V3**: Latest Chrome extension standard

  

-  **Vanilla JavaScript**: No heavy frameworks, fast and lightweight

  

-  **CSS3 Animations**: Smooth, modern UI with glassmorphism effects

  

-  **PokeAPI Integration**: Real Pokemon data for authentic experience

  

-  **Chrome Storage API**: Persistent collection across devices

  

  

### Permissions Required

  

-  `activeTab`: To spawn Pokemon on current webpage

  

-  `storage`: To save your Pokemon collection

  

-  `host_permissions`: To fetch Pokemon data from PokeAPI

  

  

### Browser Support

  

- ✅ **Chrome**: Full support (primary platform)

  

- ✅ **Edge**: Full support with Chromium engine

  

- ❓ **Firefox**: Requires manifest conversion (community contribution welcome!)

  

- ❌ **Safari**: Not supported (WebExtensions differences)

  

  

## Customization

  

  

Want to modify the extension? Here are some easy customization points:

  

  

### Spawn Settings (content.js)

  

```javascript

  

// Adjust Pokemon appearance frequency

const  SPAWN_INTERVAL  =  3000; // milliseconds between spawns

  

// Change Pokemon duration on screen

const  POKEMON_DURATION  =  2500; // milliseconds before disappearing

  

```

  

  

### UI Themes (CSS files)

  

- Modify gradient backgrounds

  

- Change glassmorphism effects

  

- Adjust animation speeds

  

- Customize color schemes

  

  

## Contributing

  

  

We welcome contributions from the Pokemon and web development community! Here's how you can help:

  

  

### Bug Reports

  

Found a bug? Please [open an issue](https://github.com/yourusername/pokemon-invasion-extension/issues) with:

  

- Browser and extension version

  

- Steps to reproduce

  

- Expected vs actual behavior

  

- Screenshots if applicable

  

  

### Feature Requests

  

Have ideas for new features? We'd love to hear them! Popular requests:

  

- [ ] Shiny Pokemon variants

  

- [ ] Pokemon battles between caught Pokemon

  

- [ ] Trading system between users

  

- [ ] Achievement system

  

- [ ] Sound effects and music

  

- [ ] Custom Pokemon spawn locations

  

- [ ] Seasonal events and special Pokemon

  

  

### Development

  

1. Fork the repository

  

2. Create a feature branch: `git checkout -b feature/amazing-feature`

  

3. Make your changes

  

4. Test thoroughly

  

5. Commit: `git commit -m 'Add amazing feature'`

  

6. Push: `git push origin feature/amazing-feature`

  

7. Open a Pull Request

  

  
  

## Credits

  

  

### Pokemon Data

  

-  **[PokeAPI](https://pokeapi.co/)**: The incredible RESTful Pokemon API

  

-  **Pokemon Company**: Original Pokemon designs and concepts

  

-  **Nintendo/Game Freak**: Pokemon franchise creators

  

  

### Libraries & Resources

  

-  **[Anime.js](https://animejs.com/)**: Lightweight animation library

  

-  **[SweetAlert2](https://sweetalert2.github.io/)**: Beautiful alert dialogs

  

-  **[ZingTouch](https://zingchart.github.io/zingtouch/)**: Touch gesture library

  

  

### Inspiration

  

-  **Pokemon GO**: Mobile game mechanics inspiration

  

-  **Chrome Extension community**: Development patterns and best practices

  

-  **My own passion for Pokemon games!**

  

## License

  

  

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  

  

**Important**: This project is a fan-made extension and is not officially affiliated with Pokemon, Nintendo, or Game Freak. All Pokemon names and images are copyrighted by their respective owners.

  

  

## Support

  

  

Love the extension? Here's how you can support the project:

  

  

- ⭐ **Star this repository** to show your appreciation

  

- 🐛 **Report bugs** to help us improve

  

- 💡 **Suggest features** for future updates

  

- 🔄 **Share with friends** who love Pokemon

  

- 💖 **Consider sponsoring** for premium features development

## Contact
-  **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/pokemon-invasion-extension/issues)
-  **Email**: hi@ivanr3d.com

---
**Happy Pokemon Hunting!**
*Gotta catch 'em all... on every website!*

![Made with Love](https://img.shields.io/badge/made%20with-❤️-red) ![Powered by PokeAPI](https://img.shields.io/badge/powered%20by-PokeAPI-blue) ![Chrome Extension](https://img.shields.io/badge/chrome-extension-yellow)