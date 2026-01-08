
export const INITIAL_USER_DATA = {
    templates: null,
    sessions: [
        {
            "id": "d7f50fc2-89fe-4e11-a471-08e816e1e622",
            "templateId": "monday-upper",
            "templateName": "Upper Body",
            "startTime": "2026-01-07T09:55:49.204Z",
            "status": "completed",
            "exercises": [
                {
                    "id": "68147ab4-762e-4c96-b1f4-db4f09a9ad9e",
                    "exerciseId": "db-press-15",
                    "exercise": {
                        "id": "db-press-15",
                        "name": "DB Press, 15 grader",
                        "description": "Dumbbell press on 15° incline bench",
                        "targetMuscles": [
                            "Chest",
                            "Shoulders",
                            "Triceps"
                        ],
                        "equipment": [
                            "Dumbbells",
                            "Bench"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 3,
                    "targetReps": "6-8",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "6a811d21-1726-4a53-9033-b8d504b866e4",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 18,
                            "completed": true
                        },
                        {
                            "id": "bb03feec-6189-47d8-9fb2-7c763265395d",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 18,
                            "completed": true
                        },
                        {
                            "id": "967cdeb3-086f-4b81-bbbb-4a566c84cf5c",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 18,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "9dfbf405-503c-4866-b3a1-1eb498edef03",
                    "exerciseId": "neutral-grip-pulldown",
                    "exercise": {
                        "id": "neutral-grip-pulldown",
                        "name": "Neutral Grip Pulldown – Lat Focused",
                        "description": "Pulldown using neutral grip handles, lat emphasis",
                        "targetMuscles": [
                            "Lats",
                            "Upper Back",
                            "Biceps"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 3,
                    "targetReps": "6-8",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "c8eea4ee-c31c-467d-a9eb-7aa7bd6bed27",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 68,
                            "completed": true
                        },
                        {
                            "id": "9022d52a-c51f-4192-9093-a5222c8e115e",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 68,
                            "completed": true
                        },
                        {
                            "id": "9e004635-1371-4d85-824a-69c8ee224f88",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 68,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "749f073a-bdc9-4998-85f2-04acbda9c0dc",
                    "exerciseId": "chest-press-pin",
                    "exercise": {
                        "id": "chest-press-pin",
                        "name": "Chest Press (Pin Loaded)",
                        "description": "Machine chest press using pin-loaded resistance",
                        "targetMuscles": [
                            "Chest",
                            "Triceps",
                            "Shoulders"
                        ],
                        "equipment": [
                            "Machine"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 2,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "bf403031-1090-4ce5-8aa9-c74baae63227",
                            "setNumber": 1,
                            "reps": 9,
                            "weight": 77,
                            "completed": true
                        },
                        {
                            "id": "82365c81-31ea-4b66-a406-d84d0d496718",
                            "setNumber": 2,
                            "reps": 9,
                            "weight": 77,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "d1de192b-ef6d-41cf-a042-4177c9f1a85f",
                    "exerciseId": "chest-supported-row-pin",
                    "exercise": {
                        "id": "chest-supported-row-pin",
                        "name": "Chest Supported Row (Pin Loaded)",
                        "description": "Row machine with chest support",
                        "targetMuscles": [
                            "Mid Back",
                            "Lats",
                            "Biceps"
                        ],
                        "equipment": [
                            "Machine"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 2,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "5919d57c-3f10-461d-9fd6-608a77032823",
                            "setNumber": 1,
                            "reps": 6,
                            "weight": 77,
                            "completed": true
                        },
                        {
                            "id": "311676ea-eb5f-4b42-bf29-c6bc50452817",
                            "setNumber": 2,
                            "reps": 6,
                            "weight": 77,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "521b900c-2237-4acb-a505-df9a8bd171f8",
                    "exerciseId": "tricep-pushdown-bar",
                    "exercise": {
                        "id": "tricep-pushdown-bar",
                        "name": "Tricep Pushdown (Bar)",
                        "description": "Pushdown using straight bar attachment",
                        "targetMuscles": [
                            "Triceps"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 3,
                    "targetReps": "8-10",
                    "restSeconds": 60,
                    "sets": [
                        {
                            "id": "0ef8473f-4582-4992-a84b-cebcb2ffe03c",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 43,
                            "completed": true
                        },
                        {
                            "id": "2409c0e6-6fc6-438f-9a7f-d412d21e3568",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 43,
                            "completed": true
                        },
                        {
                            "id": "a7ec54e6-dc71-4414-8efc-7606e97dd7f1",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 43,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "3279bd43-839f-4b9c-a0c6-fbb055f1a114",
                    "exerciseId": "cable-curls",
                    "exercise": {
                        "id": "cable-curls",
                        "name": "Cable Curls",
                        "description": "Curl using straight or rope attachment on cable",
                        "targetMuscles": [
                            "Biceps"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false,
                        "category": "weights"
                    },
                    "targetSets": 3,
                    "targetReps": "8-10",
                    "restSeconds": 120,
                    "sets": [
                        {
                            "id": "befeb721-c4ba-4fde-9ef5-954fd1fc54c2",
                            "setNumber": 1,
                            "reps": 9,
                            "weight": 40,
                            "completed": true
                        },
                        {
                            "id": "45ea1829-e4e5-401f-9249-fad6b35329c8",
                            "setNumber": 2,
                            "reps": 9,
                            "weight": 40,
                            "completed": true
                        },
                        {
                            "id": "7db29526-1b46-4aac-9b6c-f387e8724ad8",
                            "setNumber": 3,
                            "reps": 9,
                            "weight": 40,
                            "completed": true
                        }
                    ]
                }
            ],
            "didWeights": true,
            "didAbs": false,
            "endTime": "2026-01-07T09:56:17.856Z",
            "totalDuration": 2400,
            "completedAt": "2026-01-07T09:56:17.856Z",
            "tz": "Europe/Oslo"
        },
        {
            "id": "a6360fe5-d3f1-4172-bfb0-b218f5b8f1c2",
            "templateId": "wednesday-lower",
            "templateName": "Lower Body",
            "startTime": "2026-01-04T10:03:01.184Z",
            "status": "completed",
            "exercises": [
                {
                    "id": "684bbf94-1464-452b-b534-4a4a17ce3717",
                    "exerciseId": "leg-press",
                    "exercise": {
                        "id": "leg-press",
                        "name": "Leg Press",
                        "description": "Press platform away using legs while seated in machine",
                        "targetMuscles": [
                            "Quadriceps",
                            "Glutes",
                            "Hamstrings"
                        ],
                        "equipment": [
                            "Leg Press Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "6-8",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "cc0145de-3e82-433a-931a-2a4cc9389cdb",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 270,
                            "completed": true
                        },
                        {
                            "id": "be7dee8b-92a2-4cd7-95d9-90ae894e4258",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 270,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "3b68a7a5-d475-411c-b8b8-acda70fe8a15",
                    "exerciseId": "seated-hamstring-curl",
                    "exercise": {
                        "id": "seated-hamstring-curl",
                        "name": "Seated Hamstring Curl",
                        "description": "Seated leg curl machine",
                        "targetMuscles": [
                            "Hamstrings"
                        ],
                        "equipment": [
                            "Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "6f7627c4-b727-4ef0-98a3-cd20311bea74",
                            "setNumber": 1,
                            "reps": 10,
                            "weight": 70,
                            "completed": true
                        },
                        {
                            "id": "5b9231f5-9104-4483-a93f-79d1f1531371",
                            "setNumber": 2,
                            "reps": 10,
                            "weight": 70,
                            "completed": true
                        },
                        {
                            "id": "83d12320-3860-4062-8808-096ed98acd3a",
                            "setNumber": 3,
                            "reps": 10,
                            "weight": 70,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "987fdef0-20a0-48ca-acc4-76fd7ad7e70d",
                    "exerciseId": "bulgarian-split-squat",
                    "exercise": {
                        "id": "bulgarian-split-squat",
                        "name": "Bulgarian Elevated Split Squat",
                        "description": "Rear foot elevated split squat",
                        "targetMuscles": [
                            "Quadriceps",
                            "Glutes"
                        ],
                        "equipment": [
                            "Dumbbells",
                            "Bench"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "6-10",
                    "restSeconds": 120,
                    "sets": [
                        {
                            "id": "c101e5ef-de48-498d-b746-da58bd90e8ac",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 80,
                            "completed": true
                        },
                        {
                            "id": "24e12484-68c0-4b0d-b60a-4c386bc1ff3b",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 80,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "83171d90-208a-4876-ba53-15682c3d9f61",
                    "exerciseId": "seated-db-laterals",
                    "exercise": {
                        "id": "seated-db-laterals",
                        "name": "Seated DB Laterals",
                        "description": "Seated lateral raises with dumbbells",
                        "targetMuscles": [
                            "Side Deltoids"
                        ],
                        "equipment": [
                            "Dumbbells"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "b17d4ee3-9811-4486-a369-0e865eccac5f",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 9,
                            "completed": true
                        },
                        {
                            "id": "4e8c67c8-ddad-4fc6-b8e4-d8a9978c10f9",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 9,
                            "completed": true
                        },
                        {
                            "id": "935ec477-9b33-4bd8-8bd1-791061cfe22e",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 9,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "8f8fed42-d453-46a9-a330-51ed68e26c96",
                    "exerciseId": "high-cable-laterals",
                    "exercise": {
                        "id": "high-cable-laterals",
                        "name": "Cable Laterals (High Cable)",
                        "description": "Lateral raise using high cable setup",
                        "targetMuscles": [
                            "Side Deltoids"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "ffd9314a-5b25-4da6-8405-9555a60ec6db",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "ecbd6d54-fa31-42c0-9390-f3a5083a58d6",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 0,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "f9cc5667-87be-4d58-8f19-3dc670fbbfd5",
                    "exerciseId": "oh-cable-tricep-extension",
                    "exercise": {
                        "id": "oh-cable-tricep-extension",
                        "name": "OH Cable Tricep Extension",
                        "description": "Overhead tricep extension using cable",
                        "targetMuscles": [
                            "Triceps"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "6-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "78216ed5-a1b1-4755-97d5-2b0111ae4f2a",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 40,
                            "completed": true
                        },
                        {
                            "id": "de29dbe7-516a-4ce7-9595-fd8fa6f7f243",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 40,
                            "completed": true
                        },
                        {
                            "id": "f9175730-4123-49e1-851d-6e5a74357ce7",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 40,
                            "completed": true
                        }
                    ]
                }
            ],
            "endTime": "2026-01-04T10:43:10.362Z",
            "totalDuration": 2409,
            "completedAt": "2026-01-04T10:43:10.362Z",
            "tz": "Europe/Oslo",
            "didWeights": false,
            "didAbs": false
        },
        {
            "id": "d4e1f51c-7cc2-4e86-ae28-047988a330af",
            "templateId": "weekend-abs",
            "templateName": "Abs",
            "startTime": "2026-01-03T06:41:22.005Z",
            "status": "completed",
            "exercises": [
                {
                    "id": "91c3e113-cf6e-4032-a484-5556976b1800",
                    "exerciseId": "reverse-ab-crunch",
                    "exercise": {
                        "id": "reverse-ab-crunch",
                        "name": "Reverse AB Crunch",
                        "description": "Reverse crunch lifting hips off the bench",
                        "targetMuscles": [
                            "Lower Abs"
                        ],
                        "equipment": [
                            "Bench"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-15",
                    "restSeconds": 120,
                    "sets": [
                        {
                            "id": "1134050a-7a21-4733-8598-a9c73359d886",
                            "setNumber": 1,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "cfce81ab-62fe-4e48-bc5a-30d0aaea3f58",
                            "setNumber": 2,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "447fbda1-aa20-4119-80a2-7bdf7e48006c",
                            "setNumber": 3,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "2a9bb5c9-703f-4ebe-81e2-ea676521dfaf",
                    "exerciseId": "bicycle-twisting",
                    "exercise": {
                        "id": "bicycle-twisting",
                        "name": "Bicycle Twisting",
                        "description": "Alternating bicycle crunch movement",
                        "targetMuscles": [
                            "Abs",
                            "Obliques"
                        ],
                        "equipment": [
                            "None"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-15",
                    "restSeconds": 120,
                    "sets": [
                        {
                            "id": "d388aeab-2194-4330-b4a1-1b9ed54dc5ad",
                            "setNumber": 1,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "dbceb935-87d6-4aad-8078-bff6d6b25bb7",
                            "setNumber": 2,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "fd068a73-65e3-4e2a-852f-bff79539e80b",
                            "setNumber": 3,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "edb31534-9286-4357-816a-99ef3e7e2360",
                    "exerciseId": "ab-crunch",
                    "exercise": {
                        "id": "ab-crunch",
                        "name": "AB Crunch",
                        "description": "Standard abdominal crunch",
                        "targetMuscles": [
                            "Abs"
                        ],
                        "equipment": [
                            "None"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-15",
                    "restSeconds": 120,
                    "sets": [
                        {
                            "id": "1562648f-6550-43f8-a91c-64b19aff6148",
                            "setNumber": 1,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "1781f0b0-ea24-4345-be23-74005a554e83",
                            "setNumber": 2,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        },
                        {
                            "id": "07f0a8d2-468c-4b34-aa17-32b855f55b41",
                            "setNumber": 3,
                            "reps": 12,
                            "weight": 0,
                            "completed": true
                        }
                    ]
                }
            ],
            "endTime": "2026-01-03T07:07:22.711Z",
            "totalDuration": 1560,
            "completedAt": "2026-01-03T07:07:22.711Z",
            "tz": "Europe/Oslo",
            "didWeights": false,
            "didAbs": false
        },
        {
            "id": "367a0379-9699-43c8-8749-507d08434fcd",
            "templateId": "friday-full",
            "templateName": "Full Body",
            "startTime": "2026-01-02T18:51:22.767Z",
            "status": "completed",
            "exercises": [
                {
                    "id": "cf4cc1cc-a5de-4c8b-b4f1-c16c5a515579",
                    "exerciseId": "db-press-45",
                    "exercise": {
                        "id": "db-press-45",
                        "name": "DB Press, 45 grader",
                        "description": "Dumbbell press on steep incline bench",
                        "targetMuscles": [
                            "Upper Chest",
                            "Shoulders",
                            "Triceps"
                        ],
                        "equipment": [
                            "Dumbbells",
                            "Bench"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "6-8",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "80e6c74c-e241-438a-908e-15bdc5fa304b",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 26,
                            "completed": true
                        },
                        {
                            "id": "cfab0b70-ea21-4496-b139-69e900b4bd51",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 26,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "d0eaa12a-5baf-4494-8c98-951d2c059c9f",
                    "exerciseId": "wide-grip-lat-pulldown",
                    "exercise": {
                        "id": "wide-grip-lat-pulldown",
                        "name": "Wide Grip Lat Pulldown",
                        "description": "Wide grip pulldown to upper chest",
                        "targetMuscles": [
                            "Lats",
                            "Upper Back"
                        ],
                        "equipment": [
                            "Cable Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "6-8",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "fdfda862-3ecb-4b29-b9bb-f04ffbff722b",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 67,
                            "completed": true
                        },
                        {
                            "id": "4fedbe9c-ad67-4fe6-bb0b-5056fea3233c",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 67,
                            "completed": true
                        },
                        {
                            "id": "75720142-12e2-45b0-b90a-365293bca6b1",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 67,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "789beec5-5960-4c6a-abda-4725fcead69a",
                    "exerciseId": "pec-deck",
                    "exercise": {
                        "id": "pec-deck",
                        "name": "Pec Deck",
                        "description": "Chest fly movement using pec deck machine",
                        "targetMuscles": [
                            "Chest"
                        ],
                        "equipment": [
                            "Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "edf0b3f6-78ab-42fa-a818-620c53553f7c",
                            "setNumber": 1,
                            "reps": 8,
                            "weight": 77,
                            "completed": true
                        },
                        {
                            "id": "7e847910-d076-4830-b57a-5fe82a7ea89f",
                            "setNumber": 2,
                            "reps": 8,
                            "weight": 77,
                            "completed": true
                        },
                        {
                            "id": "7510dfad-9c89-4f66-9010-5ccd9847cdf9",
                            "setNumber": 3,
                            "reps": 8,
                            "weight": 77,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "65b42f73-6dad-4687-8557-81db20442fd0",
                    "exerciseId": "leg-extensions",
                    "exercise": {
                        "id": "leg-extensions",
                        "name": "Leg Extensions",
                        "description": "Extend legs against resistance using machine",
                        "targetMuscles": [
                            "Quadriceps"
                        ],
                        "equipment": [
                            "Leg Extension Machine"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "8-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "97970ff0-454d-4f2d-b702-c56904428c52",
                            "setNumber": 1,
                            "reps": 9,
                            "weight": 95,
                            "completed": true
                        },
                        {
                            "id": "4e1835d5-4a64-4bda-ac45-64b6cc29b87e",
                            "setNumber": 2,
                            "reps": 9,
                            "weight": 95,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "752d705b-4665-4333-8312-51d7b42eb85c",
                    "exerciseId": "db-preacher-curl",
                    "exercise": {
                        "id": "db-preacher-curl",
                        "name": "Dumbbell Preacher Curl",
                        "description": "Preacher curl performed with dumbbells",
                        "targetMuscles": [
                            "Biceps"
                        ],
                        "equipment": [
                            "Dumbbells",
                            "Preacher Bench"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 2,
                    "targetReps": "6-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "ba05d627-ea3e-428a-9503-91675e0e72ed",
                            "setNumber": 1,
                            "reps": 9,
                            "weight": 16,
                            "completed": true
                        },
                        {
                            "id": "272a63be-06d2-4d8f-a318-68e21d83ebed",
                            "setNumber": 2,
                            "reps": 9,
                            "weight": 16,
                            "completed": true
                        }
                    ]
                },
                {
                    "id": "b2dac354-9651-4c8d-84b8-136d93cb5947",
                    "exerciseId": "no-cheat-curls",
                    "exercise": {
                        "id": "no-cheat-curls",
                        "name": "No Cheat Curls",
                        "description": "Strict curls with controlled tempo, no body swing",
                        "targetMuscles": [
                            "Biceps"
                        ],
                        "equipment": [
                            "Dumbbells"
                        ],
                        "isCustom": false
                    },
                    "targetSets": 3,
                    "targetReps": "6-10",
                    "restSeconds": 180,
                    "sets": [
                        {
                            "id": "b58b5d2f-74c9-4100-8691-9706a8beaf8d",
                            "setNumber": 1,
                            "reps": 7,
                            "weight": 16,
                            "completed": true
                        },
                        {
                            "id": "f87a676a-7dfb-4d65-add3-f20d810ea02a",
                            "setNumber": 2,
                            "reps": 7,
                            "weight": 16,
                            "completed": true
                        },
                        {
                            "id": "b67cb54c-ccbe-4e8f-ae31-03786f517153",
                            "setNumber": 3,
                            "reps": 7,
                            "weight": 16,
                            "completed": true
                        }
                    ]
                }
            ],
            "endTime": "2026-01-02T18:52:53.429Z",
            "totalDuration": 3540,
            "completedAt": "2026-01-02T18:52:53.429Z",
            "tz": "Europe/Oslo",
            "didWeights": false,
            "didAbs": false
        }
    ],
    exercises: null,
    recipes: null,
    activityData: {
        "activityLogs": [
            {
                "id": "5390cd67-7864-45fb-9c65-008154a985e6",
                "type": "cycling",
                "durationMinutes": 40,
                "date": "2026-01-06T15:19:50.508Z"
            }
        ],
        "squashGames": []
    },
    exportedAt: "2026-01-07T12:34:55.312Z"
}
