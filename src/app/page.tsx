'use client';

import { useState } from 'react';
import { createInitialState } from '@/game/engine';

export default function Home() {
  const [gameState] = useState(createInitialState());

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Divine Right</h1>
        <div className="border p-4 rounded bg-gray-100 dark:bg-gray-800">
          <p>Status: {gameState.message}</p>
          <p>Turn: {gameState.turn}</p>
          <div className="mt-4 w-64 h-64 bg-green-200 flex items-center justify-center text-black">
            [Map Placeholder]
          </div>
        </div>
      </main>
    </div>
  );
}
