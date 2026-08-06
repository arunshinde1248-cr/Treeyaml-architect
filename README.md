# TreeYAML Architect 

TreeYAML Architect is a React-based tool that converts YAML files into an interactive tree structure. It helps developers understand and navigate complex YAML configurations by displaying nested data in a simple visual format.

## Features

- Convert YAML data into a tree view
- Expand and collapse nested nodes
- Navigate large hierarchical structures easily
- Recursive rendering of YAML objects
- Reusable React components
- Fast development workflow using Vite

## Tech Stack

- React
- TypeScript
- Vite
- YAML
- Git

## How It Works

The application takes YAML data as input, parses the structure, and recursively generates a tree representation.

Example:

```
server:
  database:
    host: localhost
    port: 5432
```

is displayed as:

```
server
│
└── database
    │
    ├── host
    └── port
```

## Project Structure

```
TreeYAML-Architect

├── src
│   ├── components
│   ├── parser
│   ├── utils
│   ├── App.tsx
│   └── main.tsx
│
├── public
├── package.json
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/TreeYAML-Architect.git
```

Go to the project folder:

```bash
cd TreeYAML-Architect
```

Install dependencies:

```bash
npm install
```

Run the project:

```bash
npm run dev
```

The application will start on:

```
http://localhost:5173
```

## Future Improvements

- YAML editing support
- Search inside YAML tree
- Syntax highlighting
- Export tree view
- Support for large YAML files

## Author

Arun Popat Shinde

Computer Science Engineering  
Cyber Security & Digital Forensics
