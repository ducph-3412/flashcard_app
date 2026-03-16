/**
 * Seed data — run once on app load when localStorage has no decks yet.
 * Creates 3 default decks with 30 cards each.
 */
import { v4 as uuidv4 } from 'uuid'
import { StorageAdapter } from './storage'
import { today } from './sm2'
import type { Card, Deck, ReviewState } from './types'

// ─── Raw card data ─────────────────────────────────────────────────────────

const JAPANESE_CARDS: [string, string][] = [
  ['日本語 (にほんご)', 'Nihongo — Japanese language'],
  ['ありがとう', 'Arigatou — Thank you'],
  ['おはようございます', 'Ohayou gozaimasu — Good morning (formal)'],
  ['こんにちは', 'Konnichiwa — Hello / Good afternoon'],
  ['こんばんは', 'Konbanwa — Good evening'],
  ['さようなら', 'Sayounara — Goodbye'],
  ['すみません', 'Sumimasen — Excuse me / I\'m sorry'],
  ['はい／いいえ', 'Hai / Iie — Yes / No'],
  ['水 (みず)', 'Mizu — Water'],
  ['食べる (たべる)', 'Taberu — To eat'],
  ['飲む (のむ)', 'Nomu — To drink'],
  ['行く (いく)', 'Iku — To go'],
  ['来る (くる)', 'Kuru — To come'],
  ['見る (みる)', 'Miru — To see / watch'],
  ['聞く (きく)', 'Kiku — To listen / ask'],
  ['話す (はなす)', 'Hanasu — To speak / talk'],
  ['読む (よむ)', 'Yomu — To read'],
  ['書く (かく)', 'Kaku — To write'],
  ['買う (かう)', 'Kau — To buy'],
  ['大きい (おおきい)', 'Ookii — Big / large'],
  ['小さい (ちいさい)', 'Chiisai — Small / little'],
  ['新しい (あたらしい)', 'Atarashii — New'],
  ['古い (ふるい)', 'Furui — Old (object)'],
  ['高い (たかい)', 'Takai — Expensive / tall'],
  ['安い (やすい)', 'Yasui — Cheap / inexpensive'],
  ['友達 (ともだち)', 'Tomodachi — Friend'],
  ['家族 (かぞく)', 'Kazoku — Family'],
  ['仕事 (しごと)', 'Shigoto — Work / job'],
  ['学校 (がっこう)', 'Gakkou — School'],
  ['電車 (でんしゃ)', 'Densha — Train / electric train'],
]

const AGENTIC_CARDS: [string, string][] = [
  ['Agentic AI', 'AI systems that autonomously plan, take actions, and iterate toward a goal without requiring step-by-step human guidance.'],
  ['ReAct (Reason + Act)', 'A prompting pattern where the model alternates between Reasoning (thinking step) and Acting (tool call), enabling multi-step problem solving.'],
  ['Tool Use', 'The ability of an LLM agent to invoke external functions, APIs, or services (e.g., web search, code execution) to complete tasks beyond text generation.'],
  ['Function Calling', 'A structured mechanism letting the model output a JSON payload that maps to a predefined function signature, enabling reliable tool invocation.'],
  ['Chain-of-Thought (CoT)', 'A prompting technique that asks the model to reason through intermediate steps before giving a final answer, improving accuracy on complex tasks.'],
  ['RAG (Retrieval-Augmented Generation)', 'Combining a retrieval system (e.g., vector search) with a generative model so the model answers based on retrieved, up-to-date context.'],
  ['Context Window', 'The maximum number of tokens (prompt + output) an LLM can process in a single call. Agents must manage what fits within this limit.'],
  ['Memory (Agent)', 'Mechanisms agents use to persist information: in-context (within prompt), external (vector DB / key-value store), or episodic (session logs).'],
  ['Planning', 'The agent\'s ability to decompose a goal into sub-tasks and sequence them effectively, often using techniques like Tree-of-Thought or LLM-as-planner.'],
  ['Multi-Agent System', 'An architecture where multiple specialised agents collaborate — one may orchestrate while others execute sub-tasks in parallel.'],
  ['Orchestrator', 'The top-level agent or process responsible for delegating tasks to sub-agents, merging results, and driving the overall workflow.'],
  ['Sub-Agent', 'A specialised agent that receives delegated tasks from an orchestrator and reports results back, focusing on a narrow capability.'],
  ['MCP (Model Context Protocol)', 'An open standard by Anthropic that defines how AI models communicate with external tools and data sources via a unified client-server interface.'],
  ['Prompt Engineering', 'The practice of crafting, structuring, and iterating on prompts to reliably elicit desired behaviour from an LLM.'],
  ['System Prompt', 'The persistent instruction block given to an LLM at the start of a conversation that defines its persona, constraints, and capabilities.'],
  ['Hallucination', 'When an LLM generates plausible-sounding but factually incorrect or fabricated information, a key risk in agentic pipelines.'],
  ['Grounding', 'Connecting model outputs to verifiable external sources (retrieved documents, database records) to reduce hallucination.'],
  ['Embeddings', 'Dense numerical vector representations of text that capture semantic meaning, enabling similarity search for RAG and memory retrieval.'],
  ['Vector Database', 'A database optimised for storing and querying high-dimensional embedding vectors (e.g., Pinecone, Qdrant, Weaviate, pgvector).'],
  ['LLM (Large Language Model)', 'A deep learning model trained on large text corpora that can generate, summarise, translate, and reason about text at scale.'],
  ['Token', 'The atomic unit of text an LLM processes — roughly 3-4 characters or ~0.75 words in English. Cost and limits are token-based.'],
  ['Temperature', 'A sampling parameter (0–2) controlling output randomness. Lower = more deterministic; higher = more creative but less reliable.'],
  ['Agent Loop', 'The observe → think → act → observe cycle an agent repeats until it reaches its goal or hits a stopping condition.'],
  ['Tool Schema', 'A JSON description of a tool\'s name, purpose, and parameters that the model reads to decide if and how to call the tool.'],
  ['Guardrails', 'Safety and quality checks applied to agent inputs/outputs to prevent harmful, off-topic, or policy-violating behaviour.'],
  ['Streaming', 'Sending LLM output tokens incrementally as they are generated, improving perceived latency in user-facing applications.'],
  ['Speculative Decoding', 'A technique where a smaller draft model proposes tokens and a larger model verifies them in batch, speeding up inference.'],
  ['Fine-tuning', 'Continued training of a pre-trained model on a domain-specific dataset to improve performance on targeted tasks.'],
  ['Spec-Driven Development', 'A workflow where AI agents build software from formal specifications — requirements, plans, and contracts — before writing code.'],
  ['Red-Green-Refactor', 'The TDD cycle: write a failing test (red) → make it pass with minimal code (green) → clean up (refactor). Mandatory in spec-driven agentic coding.'],
]

const INSPIRATIONAL_CARDS: [string, string][] = [
  ['I feel like I\'m not making any progress. How do I keep going?', 'Progress is often invisible until it suddenly isn\'t. Every day you show up is a brick laid. You can\'t see the wall from inside the scaffold — keep building.'],
  ['Why does everyone else seem to have it figured out while I\'m still lost?', 'They don\'t. They\'re just quieter about their confusion. Everyone is figuring it out as they go. Your honesty about being lost is already a step ahead.'],
  ['I failed again. How do I recover from failure?', 'Failure isn\'t the opposite of success — it\'s part of it. Every attempt teaches you something a textbook can\'t. Reset, extract the lesson, and go again.'],
  ['I\'m overwhelmed and don\'t know where to start.', 'You don\'t have to eat the elephant whole. Pick the single smallest thing that moves you forward, and do only that. Momentum is built one tiny act at a time.'],
  ['How do I stop comparing myself to others?', 'Comparison is a thief running on someone else\'s timeline. Your only useful metric is who you were yesterday. That race you can actually win.'],
  ['What if I choose the wrong path in life?', 'Most paths can be walked back from, and many wrong turns become the most interesting chapters. The cost of no decision is higher than the cost of a correctable one.'],
  ['I feel alone and like nobody understands me.', 'Loneliness is often the gap between who you are and who you\'ve let others see. The people who will truly get you exist — but they find you when you show up as yourself.'],
  ['How do I deal with people who don\'t believe in me?', 'Their doubt is data about their imagination, not your ceiling. History\'s most impactful people were almost all doubted first. Prove them irrelevant, not wrong.'],
  ['I\'m afraid to start because I might not be good enough.', '"Good enough to start" is the only qualification required. Competence is built through doing, not waiting. Imperfect action beats perfect inaction every time.'],
  ['How do I stop procrastinating on things that matter to me?', 'Procrastination is usually fear in disguise. Ask what you\'re protecting yourself from, then make the task so small that fear can\'t argue with it. Two minutes. Just start.'],
  ['I feel stuck in a job / life situation I hate. What do I do?', 'Stuck is a story, not a fact. List three things — no matter how small — that you can change today. Movement creates options; the clearest paths appear while walking.'],
  ['How do I find my purpose?', 'Purpose is rarely found — it\'s built. It lives at the intersection of what you\'re curious about, what you\'re good at, and what the world needs. Try things, notice what pulls you.'],
  ['I\'m scared of what other people think of me.', 'Most people are too busy worrying about what you think of them to spend much time judging you. Live for the audience of one — your future self.'],
  ['How do I deal with grief and loss?', 'Grief is love with nowhere to go. It doesn\'t need to be fixed or rushed. Let it take up space, and trust that carrying it gets easier even when it never fully lifts.'],
  ['I keep self-sabotaging. Why can\'t I just do what\'s good for me?', 'Self-sabotage is almost always protection from something — failure, success, change, intimacy. Get curious about what it\'s guarding, and compassion dissolves it faster than willpower.'],
  ['How do I build confidence?', 'Confidence follows action — it doesn\'t precede it. Do the scary thing once. Then again. The brain learns safety through experience, not reassurance.'],
  ['I don\'t feel motivated. How do I get motivated?', 'Wait for motivation and you\'ll wait forever. Motivation is a reward for starting, not a prerequisite. Build routines that make you act regardless of feeling — the feeling follows.'],
  ['How do I stop being so hard on myself?', 'Would you speak to a friend the way you speak to yourself? Probably not. Practice replacing self-criticism with honest, kind feedback — the kind a good coach gives.'],
  ['Why is change so hard even when I desperately want it?', 'Your brain is wired for efficiency, and change is expensive metabolically. The old pattern is a superhighway; the new one is a dirt path. Walk the dirt path daily until it paves itself.'],
  ['I feel like I\'ve wasted years of my life. Is it too late?', 'The best time to plant a tree was twenty years ago. The second best time is today. Every moment spent in regret is another one diverted from building.'],
  ['How do I handle stress and anxiety?', 'Anxiety is your nervous system trying to protect you from a threat it can\'t quite identify. Name it, breathe slowly (exhale longer than inhale), and ask: what is the one next action within my control?'],
  ['How do I ask for help without feeling weak?', 'Asking for help is a high-skill, high-trust behaviour — it\'s the opposite of weakness. The most effective people in the world are expert delegators and learners.'],
  ['I want to change but I don\'t know who I am without my old habits.', 'Identity is not discovered — it\'s chosen and practiced. Decide who you want to be, then act as if you already are, one decision at a time. The new you is built from the inside out.'],
  ['How do I stay positive when everything goes wrong?', 'Positivity isn\'t pretending problems don\'t exist. It\'s choosing to believe that you have, or can find, what\'s needed to face them. That belief is the edge.'],
  ['I feel like a fraud. What if people find out I don\'t know what I\'m doing?', 'Almost everyone in a room of competent people feels this way — it\'s called impostor syndrome. Your doubt is a sign you care about quality, not evidence that you don\'t belong.'],
  ['How do I forgive someone who hurt me deeply?', 'Forgiveness is not saying what happened was okay — it\'s releasing yourself from carrying the weight of it. You do it for your own peace, not for their absolution.'],
  ['How do I deal with rejection?', 'Rejection is redirection. It means this particular fit wasn\'t right — not that you are fundamentally lacking. Every no narrows the field toward the right yes.'],
  ['I don\'t know how to be happy. I have everything but still feel empty.', 'Happiness is rarely found in having — it\'s found in becoming, contributing, and connecting. Re-ask the question: what would make this week feel meaningful, not just comfortable?'],
  ['How do I deal with uncertainty about the future?', 'The future is always uncertain — the ones who thrive have learned to be comfortable with discomfort. Build skills, not plans. Adaptability is the ultimate security.'],
  ['How do I keep going when I\'m completely exhausted?', 'Rest is not quitting — it\'s maintenance. You cannot perform a marathon on a sprint mindset. Protect your recovery as fiercely as your effort. Sustainable beats intense every time.'],
]

// ─── Seed function ──────────────────────────────────────────────────────────

export function seedDefaultDecks() {
  // Only seed if no decks exist yet
  if (StorageAdapter.getDecks().length > 0) return

  const deckDefs = [
    { name: '🇯🇵 Japanese Vocabulary', cards: JAPANESE_CARDS },
    { name: '🤖 Agentic Coding Terms', cards: AGENTIC_CARDS },
    { name: '💡 Inspirational Q&A', cards: INSPIRATIONAL_CARDS },
  ]

  const allDecks: Deck[] = []
  const allReviewStates: Record<string, ReviewState> = {}
  const dueDate = today()

  for (const def of deckDefs) {
    const deck: Deck = {
      id: uuidv4(),
      name: def.name,
      createdAt: new Date().toISOString(),
    }
    allDecks.push(deck)

    const cards: Card[] = def.cards.map(([front, back]) => {
      const id = uuidv4()
      const now = new Date().toISOString()
      allReviewStates[id] = {
        cardId: id, interval: 0, easeFactor: 2.5,
        repetitions: 0, dueDate, lapses: 0,
      }
      return { id, deckId: deck.id, front, back, createdAt: now, updatedAt: now }
    })

    StorageAdapter.saveCards(deck.id, cards)
  }

  StorageAdapter.saveDecks(allDecks)
  StorageAdapter.saveReviewStates(allReviewStates)
}
