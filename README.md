<a name="readme-top"></a>
<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Apache 2.0][license-shield]][license-url]



<br />

# @rohmer/node-red-ankersolix

Node-Red Integration for Anker Solix Solarbanks.

## Installation

### Node-RED

You can install this package from the Node-RED palette manager by searching for `@rohmer/node-red-ankersolix`.

### NPM

1. Navigate to your Node-RED user directory. This is usually `~/.node-red`.
2. Run `npm install @rohmer/node-red-ankersolix`.
3. Restart Node-RED (`node-red-restart`).


## Available Nodes

- **SolixApi**: Global configuration node for Solix API.
- **Solix | Read Scen Info**: Read the API Endpoint Scen Info. Includes information about solarbanks and the site.
- **Solix | Set Schedule**: Sets & reads the schedule after wards.
- **Solix | Read Home Load Chart**: Reads the home load chart.

<!-- LICENSE -->
## License

Distributed under the Apache-2.0 License. See `LICENSE.txt` for more information.


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

The project originated as a fork of the [library developed by energychain][original-project-url].
I'd like to thank them for the effort put into their project.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/mrohmer/AnkerSolixE1600.svg?style=for-the-badge
[contributors-url]: https://github.com/mrohmer/AnkerSolixE1600/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/mrohmer/AnkerSolixE1600.svg?style=for-the-badge
[forks-url]: https://github.com/mrohmer/AnkerSolixE1600/network/members
[stars-shield]: https://img.shields.io/github/stars/mrohmer/AnkerSolixE1600.svg?style=for-the-badge
[stars-url]: https://github.com/mrohmer/AnkerSolixE1600/stargazers
[issues-shield]: https://img.shields.io/github/issues/mrohmer/AnkerSolixE1600.svg?style=for-the-badge
[issues-url]: https://github.com/mrohmer/AnkerSolixE1600/issues
[license-shield]: https://img.shields.io/github/license/mrohmer/AnkerSolixE1600.svg?style=for-the-badge
[license-url]: https://github.com/mrohmer/AnkerSolixE1600/blob/master/LICENSE.txt
[original-project-url]: https://github.com/energychain/AnkerSolixE1600
