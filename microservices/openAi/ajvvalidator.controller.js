const Ajv = require("ajv")

const schemaDefinition = {
    "type": "object",
    "properties": {
        "Platform": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "Cross-platform",
                    "iOS",
                    "Mac",
                    "Windows",
                    "Web",
                    "Linux",
                    "Multi-platform",
                    "Android"
                ]
            },
            "description": "Supported operating systems or environments."
        },
        "Language": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "C++",
                    "JavaScript",
                    "Swift",
                    "Rust",
                    "Kotlin",
                    "HTML5",
                    "TypeScript",
                    "Clojure",
                    "GLSL",
                    "HLSL",
                    "WGSL",
                    "MSL",
                    "CUDA",
                    "Python",
                    "Java"
                ]
            }
        },
        "Type": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "Framework",
                    "Library",
                    "SDK",
                    "Engine",
                    "IDE",
                    "Tool",
                    "Environment",
                    "API",
                    "Editor"
                ]
            }
        },
        "Purpose": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "Game Development",
                    "Visual Arts",
                    "Data Visualization",
                    "Audio Production",
                    "Video Mapping",
                    "Generative Design",
                    "3D Modeling",
                    "Live Graphics",
                    "Particle Effects",
                    "Projection Mapping"
                ]
            }
        },
        "License": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "Open Source",
                    "Commercial",
                    "Freemium"
                ]
            }
        },
        "Realtime Collaboration": {
            "type": "boolean"
        },
        "Live Coding": {
            "type": "boolean"
        }
    },
    "required": ["Platform", "Language", "Type", "Purpose", "License"]
};

const ajv = new Ajv()
const compiledAJVChecker = ajv.compile(schemaDefinition);

const avjValidateJSONStructure = (jsonObject) => {
    const valid = compiledAJVChecker(jsonObject)
    if (!valid) return false;
    return true;
};

module.exports = {
    avjValidateJSONStructure,
};
