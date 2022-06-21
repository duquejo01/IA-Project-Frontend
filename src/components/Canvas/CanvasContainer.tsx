import React, { useRef, useState } from 'react';
import CanvasDraw, { CanvasDrawProps } from 'react-canvas-draw';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { addLetter, addAttempt, selectGame, addLevel, setModalStatus } from '../../reducers/game/storageGame';
import { ModalStatuses } from '../../reducers/game/storageGameTypes';
import { stop } from '../../reducers/timer/storageTimer';


export const CanvasContainer = (): JSX.Element | null => {

  const currentCanvas = useRef<CanvasDraw>(null);
  const dispatch = useAppDispatch();
  const gameState = useAppSelector( selectGame );

  const [canvas] = useState<CanvasDrawProps>({
    canvasWidth: 500,
    canvasHeight: 500,
    brushRadius: 7,
    lazyRadius: 0,
    gridColor: '#FFFFFF',
  });

  const handleEraseCanvas = () => {
    currentCanvas.current?.clear();
  };

  const handleUndoCanvas = () => {
    currentCanvas.current?.undo();
  };

  const handleSendClick = () => {
    // const letter = getRandomLetter();
    let letter = prompt('Type a letter' )?.toUpperCase();
    if( ! letter ) letter = '';

    const { challenge, usedLetters } = gameState;
    
    /**
     * Check if its correct.
     */
    console.log({ 
      letter,
      includes: challenge?.includes( letter ),
      exists: challenge?.includes( letter ) && usedLetters.includes( letter ),
      challenge
    });
    
    /**
     * If isn't into the challenge or If was added as a successful value and is inserted again.
     */
    if( ! challenge?.includes( letter ) || challenge?.includes( letter ) && usedLetters.includes( letter ) ) {
      dispatch( addAttempt() );
      dispatch( setModalStatus( gameState.lifes >= 1 ? ModalStatuses.LOSE : ModalStatuses.GAMEOVER ) );
    } else {

      /**
       * Successful letter, add it.
       */
      let equality = 0;
      const splittedChallenge = challenge.split('');
      splittedChallenge.forEach( ( challengeLetter: string ) => {
        if( [ letter, ...usedLetters ].includes( challengeLetter ) ) {
          equality++;
        }
      });

      if( equality === splittedChallenge.length ) {
        dispatch( stop() );
        dispatch( addLevel() );
        dispatch( setModalStatus( ModalStatuses.WIN ) );
        console.log('You win!');
      }
    }

    dispatch( addLetter( letter ) );

    // Clear
    currentCanvas.current?.clear();
  };

  const handlePassAway = () => {
    // Stop timer
    prompt('Are you sure?');
    dispatch( stop() );
    dispatch( setModalStatus( ModalStatuses.LOSE ) );
  };

  return (
    <div className="bg-white w-full m-0 relative">

      <CanvasDraw { ...canvas } ref={ currentCanvas }/>
      
      <div id="controls" className="bg-slate-50 absolute bottom-0 h-24 pb-6 pt-3 px-3 w-full flex justify-between gap-2">
        <button className="canvasButton hover:bg-red-700" onClick={ handleEraseCanvas }>
          Erase
        </button>
        <button className="canvasButton hover:bg-blue-700" onClick={ handleUndoCanvas }>
          Undo
        </button>
        <button className="canvasButton hover:bg-green-700" onClick={ handleSendClick }>
         Send
        </button>
        <button className="canvasButton hover:bg-amber-700" onClick={ handlePassAway }>
         Give up
        </button>
      </div>
    </div>
  );
};
