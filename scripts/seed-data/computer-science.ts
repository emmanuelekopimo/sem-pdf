import type { SeedDoc } from "./types";

export const computerScience: SeedDoc[] = [
  {
    title: "CSC 301 Data Structures Lecture Notes",
    filename: "csc301-data-structures.pdf",
    collection: "Computer Science",
    author: "Dr. Chukwuemeka Obi, University of Nigeria Nsukka",
    daysAgo: 58,
    sections: [
      [
        "Why data structures matter",
        `A data structure is a way of arranging data in memory so that the operations a program needs are cheap. The same list of student records can be stored as an array, a linked list or a tree, and each choice makes some operations fast and others slow.

In this course we measure cost with Big O notation. Looking up the tenth item in an array is O(1) because the address can be computed directly. Finding a matric number in an unsorted list is O(n) because, in the worst case, every record must be checked.`,
      ],
      [
        "Arrays and linked lists",
        `An array stores elements in one continuous block of memory. Reading any position is instant, but inserting in the middle means shifting every later element one place to the right.

A singly linked list stores each element in a node that holds the value and a pointer to the next node. Inserting after a known node only changes two pointers, so it is O(1), but reaching the hundredth node means following ninety nine pointers first. Linked lists are useful for queues at a bank hall where people join at the back and leave from the front.`,
      ],
      [
        "Stacks and queues",
        `A stack is last in, first out. Think of plates in the departmental cafeteria: the last plate placed on top is the first one taken. Stacks are used for undo features, for checking balanced brackets in code and for the call stack that tracks function calls.

A queue is first in, first out, like students waiting to collect results at the exams office. Queues are used in printers, in operating system schedulers and in breadth first search on graphs. Both structures can be built on top of arrays or linked lists.`,
      ],
      [
        "Binary search trees",
        `A binary search tree keeps every value in the left subtree smaller than the node and every value in the right subtree larger. Searching, inserting and deleting take time proportional to the height of the tree.

If values arrive in sorted order the tree becomes a long chain and the height grows to n, which is no better than a list. Balanced trees such as AVL trees and red black trees rotate nodes after each insertion so that the height stays close to log n, even for a registry of forty thousand students.`,
      ],
      [
        "Hash tables",
        `A hash table uses a hash function to turn a key, such as a matric number, into an index in an array. When the function spreads keys evenly, lookups take constant time on average.

Two different keys can produce the same index. This is called a collision. Chaining stores colliding items in a small list at that index, while open addressing searches for the next free slot. When the table becomes too full, it is resized and every key is inserted again.`,
      ],
      [
        "Graphs",
        `A graph is a set of vertices joined by edges. A road map of Enugu, a network of friends on social media and the prerequisite chart for departmental courses can all be modelled as graphs.

Graphs are stored as adjacency matrices or adjacency lists. Breadth first search finds the shortest path when every edge has the same weight. Dijkstra's algorithm finds shortest paths when roads have different lengths, as long as no length is negative.`,
      ],
    ],
  },
  {
    title: "Introduction to Machine Learning",
    filename: "intro-machine-learning.pdf",
    collection: "Computer Science",
    author: "Department of Computer Science, Covenant University",
    daysAgo: 45,
    sections: [
      [
        "What machine learning is",
        `Machine learning is the study of programs that improve at a task by learning patterns from examples instead of following rules written by hand. A spam filter learns from emails that people have marked as spam, and a crop disease detector learns from labelled photos of leaves.

There are three broad families. Supervised learning uses labelled examples. Unsupervised learning finds structure in unlabelled data, such as grouping customers by spending. Reinforcement learning learns by trial and error from rewards.`,
      ],
      [
        "Training, validation and testing",
        `A dataset is split into a training set, a validation set and a test set. The model learns from the training set, settings are tuned on the validation set, and the final score is reported on the test set that the model has never seen.

Overfitting happens when a model memorises the training data, including its noise, and then performs poorly on new data. A model that predicts exam scores perfectly for last year's students but badly for this year's students is overfitting. Regularisation, more data and simpler models reduce this problem.`,
      ],
      [
        "Linear and logistic regression",
        `Linear regression predicts a number, such as the price of a flat in Yaba from its size and distance to the main road. It fits a straight line that minimises the squared difference between predictions and real prices.

Logistic regression predicts a probability between zero and one, such as the chance that a loan applicant will default. Despite its name it is a classification method. Both models are trained with gradient descent, which adjusts the weights a little at a time in the direction that reduces the error.`,
      ],
      [
        "Neural networks",
        `A neural network is made of layers of simple units. Each unit multiplies its inputs by weights, adds them up and passes the result through an activation function. Stacking many layers lets the network learn complicated patterns such as handwriting or speech.

Training uses backpropagation to compute how much each weight contributed to the error. Deep networks need a lot of data and computing power, which is why graphics processors are used. Smaller models can still run on a phone or laptop once they are trained.`,
      ],
      [
        "Text embeddings",
        `An embedding is a list of numbers that represents the meaning of a piece of text. Sentences with similar meanings end up close together in this number space, even when they use different words. For example, "how to plant cassava" and "growing cassava on a farm" have embeddings that point in nearly the same direction.

Similarity between two embeddings is usually measured with cosine similarity, which compares the angle between the vectors. Semantic search engines embed every passage in a collection, embed the user's question, and return the passages with the highest similarity.`,
      ],
      [
        "Evaluating models fairly",
        `Accuracy alone can be misleading. If only five percent of transactions are fraudulent, a model that always says "not fraud" is ninety five percent accurate and completely useless. Precision, recall and the F1 score give a fuller picture.

Fairness also matters. A face recognition system trained mostly on lighter skinned faces may perform worse on darker skinned faces. Teams should test models on data that reflects the people who will actually use them, including users across Nigeria's regions and languages.`,
      ],
    ],
  },
  {
    title: "Database Design and SQL",
    filename: "database-design-sql.pdf",
    collection: "Computer Science",
    author: "Mrs. Folake Adeyemi, Obafemi Awolowo University",
    daysAgo: 40,
    sections: [
      [
        "Relational databases",
        `A relational database stores data in tables made of rows and columns. Each table describes one kind of thing, such as students, courses or payments. A primary key uniquely identifies each row, and a foreign key links a row to a row in another table.

Keeping data in separate related tables avoids repeating the same information. A student's address is stored once in the students table instead of on every course registration.`,
      ],
      [
        "Normalisation",
        `Normalisation is the process of organising tables to remove repeated data and update problems. First normal form requires each cell to hold a single value. Second normal form removes columns that depend on only part of a composite key. Third normal form removes columns that depend on other non key columns.

If a department's name is stored on every lecturer row, renaming the department means updating hundreds of rows, and missing one leaves the data inconsistent. Moving department details to their own table fixes this.`,
      ],
      [
        "Writing SQL queries",
        `SELECT retrieves data, WHERE filters rows, JOIN combines related tables and GROUP BY summarises rows. For example, a query can list the total school fees paid in Naira by each faculty for the current session.

Aggregate functions such as COUNT, SUM and AVG work together with GROUP BY. HAVING filters groups after they are summarised, for example to show only faculties where more than two hundred students are still owing fees.`,
      ],
      [
        "Indexes and performance",
        `An index is a separate structure, usually a B tree, that lets the database find rows without scanning the whole table. Searching forty thousand student records by matric number becomes almost instant once that column is indexed.

Indexes speed up reads but slow down writes, because each insert must also update the index. A good rule is to index columns that appear often in WHERE clauses and JOIN conditions, and to check the query plan with EXPLAIN.`,
      ],
      [
        "Transactions",
        `A transaction groups several statements so that they all succeed or all fail. When a student pays hostel fees, the payment must be recorded and the bed must be allocated together. If the second step fails, the first must be undone.

Transactions follow the ACID properties: atomicity, consistency, isolation and durability. Durability means that once the database confirms a transaction, the data survives even if the server loses power a second later.`,
      ],
    ],
  },
  {
    title: "Computer Networks and the Internet",
    filename: "computer-networks.pdf",
    collection: "Computer Science",
    author: "Engr. Ibrahim Musa, Ahmadu Bello University",
    daysAgo: 37,
    sections: [
      [
        "Layers of a network",
        `Networks are described in layers so that each layer can change without breaking the others. The physical layer moves bits over copper, fibre or radio. The data link layer moves frames between neighbouring devices. The network layer, using IP, moves packets across many networks. The transport layer, using TCP or UDP, delivers data between programs.

When a student opens the university portal, the browser, operating system, Wi-Fi card and campus routers each handle their own layer of the work.`,
      ],
      [
        "IP addresses and routing",
        `Every device on the internet has an IP address. IPv4 addresses such as 192.168.1.10 are running out, so many homes and campuses share one public address through network address translation. IPv6 uses much longer addresses and removes this shortage.

Routers forward packets hop by hop toward their destination using routing tables. Protocols such as BGP let internet providers like MTN, Airtel and Glo announce which address ranges they can reach.`,
      ],
      [
        "TCP and UDP",
        `TCP provides a reliable stream. It numbers every byte, waits for acknowledgements and resends anything that is lost. It also slows down when the network is congested. Web pages, email and file downloads use TCP.

UDP sends packets without guarantees. It is faster and has less overhead, so it suits live video calls and online games where a late packet is useless anyway. Modern protocols such as QUIC build reliability on top of UDP.`,
      ],
      [
        "DNS and the web",
        `People remember names like unn.edu.ng, while computers need IP addresses. The Domain Name System translates names into addresses through a hierarchy of servers. Answers are cached so that repeated lookups are fast.

HTTP is the language of the web. A browser sends a request for a page, and the server responds with a status code and content. HTTPS wraps HTTP in TLS encryption so that passwords and card details cannot be read by others on the same network.`,
      ],
      [
        "Network security basics",
        `Common threats include phishing messages that trick users into revealing passwords, malware spread through infected flash drives, and denial of service attacks that flood a server with traffic.

Defences include strong unique passwords, two factor authentication, firewalls that block unwanted connections, regular software updates and backups stored offline. Most successful attacks on organisations start with a single person clicking a convincing link.`,
      ],
    ],
  },
  {
    title: "Operating Systems Process Scheduling",
    filename: "os-process-scheduling.pdf",
    collection: "Computer Science",
    author: "Dr. Ngozi Eze, University of Lagos",
    daysAgo: 30,
    sections: [
      [
        "Processes and threads",
        `A process is a running program with its own memory space. A thread is a path of execution inside a process, and threads in the same process share memory. A web browser may run one process per tab and several threads inside each tab.

The operating system keeps a process control block for every process, recording its state, registers, open files and memory map. Switching the CPU from one process to another is called a context switch.`,
      ],
      [
        "Scheduling algorithms",
        `First come, first served runs jobs in the order they arrive, which is simple but lets one long job delay many short ones. Shortest job first gives the lowest average waiting time but needs to know how long each job will take.

Round robin gives each process a small time slice, such as ten milliseconds, in turn. It keeps interactive programs responsive. Priority scheduling runs important processes first, and ageing slowly raises the priority of waiting processes so that none of them starves.`,
      ],
      [
        "Deadlock",
        `A deadlock happens when processes wait for each other forever. Process A holds the printer and wants the scanner, while process B holds the scanner and wants the printer. Neither can continue.

Four conditions must all hold for deadlock: mutual exclusion, hold and wait, no preemption and circular wait. Systems prevent deadlock by breaking one condition, for example by requiring every process to request resources in the same fixed order.`,
      ],
      [
        "Memory management",
        `Virtual memory gives each process the illusion of a large private address space. Memory is divided into fixed size pages, and a page table maps virtual pages to physical frames.

When physical memory is full, the system moves rarely used pages to disk. If a computer spends more time moving pages than doing useful work, it is thrashing. Adding RAM or running fewer programs at once fixes thrashing.`,
      ],
    ],
  },
  {
    title: "Software Engineering Project Guide",
    filename: "software-engineering-guide.pdf",
    collection: "Computer Science",
    author: "Department of Computer Science, Federal University of Technology Akure",
    daysAgo: 21,
    sections: [
      [
        "Gathering requirements",
        `Every project begins by understanding what users actually need. Interview the people who will use the system, watch how they work today and write down the problems they face. A hostel allocation system for a university should start by talking to students, porters and the student affairs office.

Write requirements as short user stories, for example: as a student, I want to see my allocated room so that I know where to move in. Each story should have clear acceptance criteria.`,
      ],
      [
        "Choosing a process",
        `The waterfall model moves through requirements, design, building, testing and release in strict order. It suits projects where requirements are fixed. Agile methods such as Scrum deliver working software in short cycles of one or two weeks and adjust as feedback arrives.

For a final year project with a fixed deadline and a supervisor who reviews progress, a simple agile approach with weekly goals usually works best.`,
      ],
      [
        "Version control with Git",
        `Git records every change to the code, who made it and why. Developers work on separate branches and merge their work through pull requests that teammates review.

Commit small changes often, with clear messages that explain the reason for the change. Never commit passwords or API keys. If something breaks, Git makes it easy to find the change that caused it and to roll it back.`,
      ],
      [
        "Testing software",
        `Unit tests check single functions in isolation. Integration tests check that parts work together, for example that the code really saves a record in the database. End to end tests drive the whole application through a browser the way a user would.

Automated tests should run on every change. A bug found by a test on a developer's laptop costs minutes to fix. The same bug found by users after release can cost days and damage trust.`,
      ],
      [
        "Presenting your project",
        `A good project presentation tells a short story: the problem, who has it, what you built, a live demonstration and what you learned. Keep slides simple and let the demonstration carry the talk.

Rehearse the demonstration several times and prepare sample data in advance so that every screen has something meaningful to show. Have screenshots ready in case the network fails during the presentation.`,
      ],
    ],
  },
  {
    title: "Cybersecurity Awareness for Students",
    filename: "cybersecurity-awareness.pdf",
    collection: "Computer Science",
    author: "ICT Directorate, University of Ibadan",
    daysAgo: 6,
    sections: [
      [
        "Protecting your accounts",
        `Use a different password for your school email, your bank app and your social media. A password manager can remember them for you. Long passphrases made of several random words are easier to remember and harder to crack than short complex passwords.

Turn on two step verification wherever it is offered. Even if someone steals your password, they cannot sign in without the code sent to your phone.`,
      ],
      [
        "Recognising scams",
        `Fraudsters often pretend to be the bursary, a bank or a scholarship body. They create urgency, for example by claiming your account will be blocked today unless you share your BVN or one time password.

No genuine bank or university staff will ever ask for your PIN or OTP. When in doubt, call the official number on the bank's website or visit the office in person. Report suspicious messages to the ICT helpdesk.`,
      ],
      [
        "Safe use of public Wi-Fi",
        `Free Wi-Fi in cafes and campus common rooms can be monitored by others on the same network. Avoid logging into banking apps on public networks, or use your mobile data instead.

Check that websites use HTTPS before entering passwords. Keep your phone and laptop updated, because updates close security holes that attackers already know about.`,
      ],
      [
        "Backing up your work",
        `Students lose final year projects every session to stolen laptops, failed hard drives and ransomware. Keep at least one copy of important work in cloud storage and another on an external drive that is not always connected.

Test your backups by restoring a file now and then. A backup that cannot be restored is not a backup.`,
      ],
    ],
  },
];
