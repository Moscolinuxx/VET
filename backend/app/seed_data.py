"""
Disease library content, condensed from the study's own Chapter 2 review
(2.2.1 - 2.2.5). Served as static data by /api/diseases - no DB table needed
since this content doesn't change per-user.
"""

DISEASES = [
    {
        "key": "rabies",
        "name": "Rabies",
        "pathogen_type": "Viral (central nervous system)",
        "transmission": "Mainly through infected saliva following a bite or scratch. Dogs account for about 99% of human rabies transmission globally.",
        "dog_signs": [
            "Behavioural change / aggression",
            "Excessive salivation",
            "Difficulty swallowing",
            "Poor coordination",
            "Paralysis (late stage)",
        ],
        "human_risk": "Almost always fatal once clinical signs appear in humans. Any bite, scratch, or saliva contact from a suspected case is a medical emergency.",
        "prevention": [
            "Keep dog vaccination up to date",
            "Avoid contact with unknown or stray dogs",
            "Seek immediate post-exposure prophylaxis after any bite/scratch",
            "Report suspected cases to veterinary/public health authorities",
        ],
        "urgency": "Emergency",
    },
    {
        "key": "leptospirosis",
        "name": "Leptospirosis",
        "pathogen_type": "Bacterial (Leptospira spp.)",
        "transmission": "Contaminated urine, wet soil, stagnant water, or rodents. Infected dogs shed the bacteria through urine.",
        "dog_signs": [
            "Fever",
            "Vomiting",
            "Weakness",
            "Dehydration",
            "Kidney or liver abnormalities",
        ],
        "human_risk": "Transmitted through contact with infected urine or contaminated water/soil; can cause flu-like illness to severe organ involvement in humans.",
        "prevention": [
            "Vaccinate dogs against leptospirosis",
            "Provide clean drinking water",
            "Control rodents around the home",
            "Avoid contact with stagnant water or flood water",
        ],
        "urgency": "High",
    },
    {
        "key": "ringworm",
        "name": "Ringworm (Dermatophytosis)",
        "pathogen_type": "Fungal (dermatophytes)",
        "transmission": "Direct contact with an infected animal or contaminated objects (bedding, grooming tools).",
        "dog_signs": [
            "Circular or irregular hair loss",
            "Scaling of the skin",
            "Redness",
            "Crusting",
        ],
        "human_risk": "Easily transmissible to humans through skin contact, causing itchy circular rashes. Especially important to manage around children.",
        "prevention": [
            "Isolate and treat infected animals promptly",
            "Disinfect bedding and grooming equipment",
            "Wash hands after handling an affected dog",
            "Avoid sharing towels/brushes between pets",
        ],
        "urgency": "Moderate",
    },
    {
        "key": "scabies",
        "name": "Scabies (Sarcoptic Mange)",
        "pathogen_type": "Parasitic (Sarcoptes scabiei mites)",
        "transmission": "Highly contagious among dogs through direct contact; mites can cause temporary irritation in humans.",
        "dog_signs": [
            "Intense itching",
            "Hair loss",
            "Redness",
            "Crusting and skin thickening",
        ],
        "human_risk": "Can cause temporary itchy skin irritation in humans, though the mite does not typically complete its life cycle on human skin.",
        "prevention": [
            "Treat affected dogs promptly under veterinary care",
            "Clean and disinfect bedding and living areas",
            "Limit close skin contact until treatment is complete",
            "Manage contact animals in multi-dog households",
        ],
        "urgency": "Moderate",
    },
    {
        "key": "helminthosis",
        "name": "Helminthosis (Intestinal Worms)",
        "pathogen_type": "Parasitic (roundworms, hookworms, tapeworms)",
        "transmission": "Contaminated soil, faeces, food, water, fleas, or infected intermediate hosts.",
        "dog_signs": [
            "Vomiting",
            "Diarrhoea",
            "Bloody stool",
            "Weakness / poor body condition",
        ],
        "human_risk": "Some species (e.g. roundworms) can infect humans, particularly children, through contaminated soil or poor hand hygiene.",
        "prevention": [
            "Maintain a regular deworming schedule",
            "Control fleas",
            "Dispose of dog faeces promptly",
            "Practice hand hygiene, especially for children",
        ],
        "urgency": "Low",
    },
]
