export const formPage = [
    {
        heading: "What is Omnichannel Ordering Solution?",
        content: [
            {
                heading: "What is Omnichannel Ordering Solution?",
                body: `
                The Omnichannel Ordering Solution demo highlights how MongoDB can streamline the
                shopping experience by integrating online and in- store systems, enabling real-time
                inventory visibility and efficient order management. This solution supports Buy Online,
                Pick Up in Store (BOPIS) and home delivery options, reducing logistical issues while
                enhancing the customer journey. This unified approach ensures smooth transactions,
                up-to-date inventory, and improved customer satisfaction across multiple touchpoints.
                `,
            },
            {
                heading: "How to Demo this page",
                body: [
                    {
                        heading: "Click on “Proceed to Checkout”, in case you don’t see that button click first on “Fill cart” to get random products into the cart.",
                        body: []
                    },
                    {
                        heading: "Then you should see the “Proceed to checkout” button.",
                        body: []
                    }
                ]

            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            // {
            //     image: {
            //         src: "/rsc/diagrams/omnichannel.svg",
            //         alt: "Architecture",
            //     },
            // },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            // {
            //     image: {
            //         src: "/rsc/diagrams/chatbotDiagram.png",
            //         alt: "Architecture",
            //     },
            // }
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Easy, Flexible and Fast",
                body: "MongoDB?s document model combines simplicity and flexibility, aligning with how developers naturally structure and retrieve data. This makes queries more intuitive and improves performance. As business needs evolve, the schema adapts seamlessly, allowing for rapid iteration without rigid constraints.",
            },
            {
                heading: "Real-Time Data Responsiveness",
                body: "Leverage MongoDB's Change Streams and Triggers to keep your data synchronized across all systems in real time. Whether updating order statuses or automating processes, MongoDB ensures seamless synchronization, all without adding an extra layer of complexity."
            },
            {
                heading: "Smart Customer Experience with RAG",
                body: "MongoDB Atlas and Dataworkz combine to deliver Agentic RAG-as-a-Service, improving customer interactions with smart, context-aware AI. Atlas uses vector embeddings for more accurate, meaning-based searches, while its scalable infrastructure ensures reliability during peak traffic. Dataworkz enhances this with agentic workflows powered by RAG pipelines, leveraging semantic search and knowledge graphs to pull the most relevant data for AI-driven responses."
            }
        ],
    },
]
export const catalogPage = [
    {
        heading: "What is a product description generator?",
        content: [
            {
                heading: "Product description generator?",
                body: `
                
                
                `,
            },
            {
                heading: "How to Demo this page",
                body: [
                    {
                        heading: "Highlight the 2 shipping methods available ‘Buy Online, Pickup in store’ (BOPIS) which shows a list of available stores to pick up the order. And ‘Buy Online, Get Delivery At home’ which shows the address of that specific user",
                        body: []
                    },
                    {
                        heading: "Click on “Continue” once you have selected your preferred shipping method. This will generate the order and redirect you to the ”Order Details” page.",
                        body: []
                    }
                ]

            },

        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            // {
            //     image: {
            //         src: "/rsc/diagrams/omnichannel.svg",
            //         alt: "Architecture",
            //     },
            // },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            // {
            //     image: {
            //         src: "/rsc/diagrams/chatbotDiagram.png",
            //         alt: "Architecture",
            //     },
            // }
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Easy, Flexible and Fast",
                body: "MongoDB?s document model combines simplicity and flexibility, aligning with how developers naturally structure and retrieve data. This makes queries more intuitive and improves performance. As business needs evolve, the schema adapts seamlessly, allowing for rapid iteration without rigid constraints.",
            },
            {
                heading: "Real-Time Data Responsiveness",
                body: "Leverage MongoDB's Change Streams and Triggers to keep your data synchronized across all systems in real time. Whether updating order statuses or automating processes, MongoDB ensures seamless synchronization, all without adding an extra layer of complexity."
            },
            {
                heading: "Smart Customer Experience with RAG",
                body: "MongoDB Atlas and Dataworkz combine to deliver Agentic RAG-as-a-Service, improving customer interactions with smart, context-aware AI. Atlas uses vector embeddings for more accurate, meaning-based searches, while its scalable infrastructure ensures reliability during peak traffic. Dataworkz enhances this with agentic workflows powered by RAG pipelines, leveraging semantic search and knowledge graphs to pull the most relevant data for AI-driven responses."
            }
        ],
    },
]