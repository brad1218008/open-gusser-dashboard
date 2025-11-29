'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileJson } from 'lucide-react';

interface PlayerData {
    competitionPlayerId: string;
    rawPlayerId: string;
    name: string;
    currentTotal: number | null; // Previous total score
    lastInputScore: number | null; // Existing score for this round if editing
    isRejoin: boolean;
}

interface ScoreFormProps {
    competitionId: string;
    roundId: string;
    roundNumber: number;
    mapName: string;
    gameCount: number;
    players: PlayerData[];
}

export default function ScoreForm({ competitionId, roundId, roundNumber, mapName, gameCount, players }: ScoreFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const gameIndex = Number(searchParams.get('game') || 1);

    const [inputs, setInputs] = useState<Record<string, number | ''>>(() => {
        const initial: Record<string, number | ''> = {};
        players.forEach(p => {
            // Default to lastInputScore if exists (editing), otherwise default to currentTotal (previous total)
            initial[p.competitionPlayerId] = p.lastInputScore ?? (p.currentTotal ?? '');
        });
        return initial;
    });

    const [rejoins, setRejoins] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        players.forEach(p => {
            initial[p.competitionPlayerId] = p.isRejoin;
        });
        return initial;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [jsonMessage, setJsonMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showBookmarkletTip, setShowBookmarkletTip] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Reset states when gameIndex changes (navigating between games)
    useEffect(() => {
        setIsSubmitting(false);
        setJsonInput('');
        setJsonMessage(null);
        setSuccessMessage(null);
    }, [gameIndex]);

    const handleScoreChange = (id: string, value: string) => {
        const num = value === '' ? '' : parseInt(value, 10);
        setInputs(prev => ({ ...prev, [id]: num }));
    };

    const handleJsonPaste = () => {
        setJsonMessage(null);
        try {
            const data = JSON.parse(jsonInput);

            if (!Array.isArray(data)) {
                setJsonMessage({ type: 'error', text: 'JSON must be an array' });
                return;
            }

            let matchedCount = 0;
            const newInputs = { ...inputs };

            data.forEach((item: any) => {
                if (!item.name || item.point === undefined) {
                    return;
                }

                // Find matching player (case-insensitive)
                const matchedPlayer = players.find(p =>
                    p.name.toLowerCase() === item.name.toLowerCase()
                );

                if (matchedPlayer) {
                    const score = parseInt(item.point, 10);
                    if (!isNaN(score)) {
                        newInputs[matchedPlayer.competitionPlayerId] = score;
                        matchedCount++;
                    }
                }
            });

            setInputs(newInputs);
            setJsonMessage({
                type: 'success',
                text: `Successfully updated ${matchedCount} player(s)`
            });

            // Clear the input after successful parse
            if (matchedCount > 0) {
                setJsonInput('');
            }
        } catch (error) {
            setJsonMessage({
                type: 'error',
                text: 'Invalid JSON format. Please check your input.'
            });
        }
    };

    const handleJsonPasteAndSave = async () => {
        setJsonMessage(null);
        try {
            const data = JSON.parse(jsonInput);

            if (!Array.isArray(data)) {
                setJsonMessage({ type: 'error', text: 'JSON must be an array' });
                return;
            }

            let matchedCount = 0;
            const newInputs = { ...inputs };

            data.forEach((item: any) => {
                if (!item.name || item.point === undefined) {
                    return;
                }

                // Find matching player (case-insensitive)
                const matchedPlayer = players.find(p =>
                    p.name.toLowerCase() === item.name.toLowerCase()
                );

                if (matchedPlayer) {
                    const score = parseInt(item.point, 10);
                    if (!isNaN(score)) {
                        newInputs[matchedPlayer.competitionPlayerId] = score;
                        matchedCount++;
                    }
                }
            });

            if (matchedCount === 0) {
                setJsonMessage({
                    type: 'error',
                    text: 'No matching players found'
                });
                return;
            }

            setInputs(newInputs);
            setJsonInput('');

            // Check if all scores are unchanged before saving
            const allUnchanged = checkAllScoresUnchanged(newInputs);
            if (allUnchanged) {
                setShowConfirmDialog(true);
            } else {
                await submitScores(newInputs);
            }
        } catch (error) {
            setJsonMessage({
                type: 'error',
                text: 'Invalid JSON format. Please check your input.'
            });
        }
    };

    const checkAllScoresUnchanged = (currentInputs: Record<string, number | ''> = inputs): boolean => {
        // Check if all players have the same score as their previous total
        return players.every(p => {
            const inputScore = Number(currentInputs[p.competitionPlayerId] || 0);
            const previousTotal = p.currentTotal ?? 0;
            return inputScore === previousTotal;
        });
    };

    const submitScores = async (currentInputs: Record<string, number | ''> = inputs) => {
        setIsSubmitting(true);

        const scoresToSubmit = players.map(p => ({
            playerId: p.rawPlayerId,
            inputTotalScore: Number(currentInputs[p.competitionPlayerId] || 0),
            isRejoin: rejoins[p.competitionPlayerId] || false,
            gameIndex: gameIndex
        }));

        try {
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roundId,
                    scores: scoresToSubmit
                })
            });

            if (!res.ok) throw new Error('Failed to submit scores');

            // Show success message
            setSuccessMessage('Scores saved successfully!');

            // Reset submitting state before navigation
            setIsSubmitting(false);

            // Navigate after a brief delay to show success message
            setTimeout(() => {
                if (gameIndex < gameCount) {
                    router.push(`/competitions/${competitionId}/rounds/${roundId}/score?game=${gameIndex + 1}`);
                } else {
                    router.push(`/competitions/${competitionId}`);
                }
                router.refresh();
            }, 800);
        } catch (error) {
            console.error(error);
            alert('Error submitting scores');
            setIsSubmitting(false);
        }
    };

    const toggleRejoin = (id: string) => {
        setRejoins(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleAllRejoins = () => {
        const allSelected = players.every(p => rejoins[p.competitionPlayerId]);
        const newState: Record<string, boolean> = {};
        players.forEach(p => {
            newState[p.competitionPlayerId] = !allSelected;
        });
        setRejoins(newState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if all scores are unchanged
        const allUnchanged = checkAllScoresUnchanged();
        if (allUnchanged) {
            setShowConfirmDialog(true);
        } else {
            await submitScores();
        }
    };

    const handleConfirmZeroScores = async () => {
        setShowConfirmDialog(false);
        await submitScores();
    };

    const handleCancelConfirm = () => {
        setShowConfirmDialog(false);
    };

    const allRejoinsSelected = players.length > 0 && players.every(p => rejoins[p.competitionPlayerId]);

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <Link href={`/competitions/${competitionId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    <ArrowLeft size={16} />
                    Back to Competition
                </Link>
                <h1 className="heading-1">Round {roundNumber} - Game {gameIndex}</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{mapName}</p>
            </header>

            {/* Success Notification */}
            {successMessage && (
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 500,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <span style={{ fontSize: '1.2rem' }}>✓</span>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                {/* JSON Import Section */}
                <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <FileJson size={20} style={{ color: '#60a5fa' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#e2e8f0' }}>Import Scores from JSON</h3>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Paste JSON in format: <code style={{ backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>[{`{"name": "PlayerName", "point": "26"}`}]</code>
                    </p>

                    {/* Bookmarklet Tip */}
                    <div style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: '#0f172a',
                        borderRadius: '6px',
                        border: '1px solid #1e293b'
                    }}>
                        <button
                            type="button"
                            onClick={() => setShowBookmarkletTip(!showBookmarkletTip)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#60a5fa',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: showBookmarkletTip ? '0.75rem' : 0
                            }}
                        >
                            <span style={{
                                transform: showBookmarkletTip ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                display: 'inline-block'
                            }}>▶</span>
                            💡 Quick Tip: Auto-extract scores from Open Guessr
                        </button>

                        {showBookmarkletTip && (
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    You can automatically extract scores from Open Guessr and copy them as JSON:
                                </p>
                                <ol style={{ marginLeft: '1.25rem', marginBottom: '0.75rem' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>
                                        Create a new bookmark in your browser
                                    </li>
                                    <li style={{ marginBottom: '0.5rem' }}>
                                        Copy and paste this code as the bookmark URL:
                                    </li>
                                </ol>
                                <div style={{
                                    backgroundColor: '#020617',
                                    padding: '0.75rem',
                                    borderRadius: '4px',
                                    marginBottom: '0.75rem',
                                    overflowX: 'auto'
                                }}>
                                    <code style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        wordBreak: 'break-all',
                                        display: 'block'
                                    }}>
                                        javascript:(async%20function(){`{function%20sleep(ms){return%20new%20Promise(resolve=>setTimeout(resolve,ms));}function%20fallbackCopyTextToClipboard(text){const%20textArea=document.createElement("textarea");textArea.value=text;textArea.style.position="fixed";textArea.style.left="-9999px";textArea.style.top="-9999px";document.body.appendChild(textArea);textArea.focus();textArea.select();try{const%20successful=document.execCommand('copy');document.body.removeChild(textArea);return%20successful;}catch(err){document.body.removeChild(textArea);return%20false;}}async%20function%20runScoreExtractor(startElementId){const%20SCORE_CONTAINER_SELECTOR=".player-box";const%20CLOSE_SELECTOR="button.closePopupButton";let%20startElement=document.getElementById(startElementId);if(!startElement)return%20null;let%20targetButton=null;let%20nextSibling=startElement.nextElementSibling;while(nextSibling){if(nextSibling.tagName==='BUTTON'){targetButton=nextSibling;break;}nextSibling=nextSibling.nextElementSibling;}if(!targetButton)return%20null;targetButton.click();await%20sleep(1000);const%20scoreContainer=document.querySelector(SCORE_CONTAINER_SELECTOR);const%20results=[];if(scoreContainer){const%20playerEntries=scoreContainer.querySelectorAll('.player-entry');playerEntries.forEach(entry=>{const%20nameElement=entry.querySelector('.player-username');const%20scoreElement=entry.querySelector('.player-score');if(nameElement&&scoreElement){const%20name=nameElement.textContent?nameElement.textContent.trim():'Unknown';let%20pointText=scoreElement.textContent?scoreElement.textContent.trim():'0%20Pts.';let%20pointStr=pointText.replace(/\s*Pts\.?$/i,'').replace(/,/g,'').trim();const%20point=parseInt(pointStr,10);results.push({name:name,point:point});}});}const%20jsonResult=JSON.stringify(results,null,2);let%20copySuccess=false;if(navigator.clipboard&&window.isSecureContext){try{await%20navigator.clipboard.writeText(jsonResult);copySuccess=true;}catch(err){}}if(!copySuccess){copySuccess=fallbackCopyTextToClipboard(jsonResult);}if(!copySuccess){window.prompt("%E3%80%90%E8%AB%8B%E6%8C%89%20Ctrl+C/Cmd%2BC%20%E8%A4%87%E8%A3%BD%E3%80%91%E6%8F%90%E5%8F%96%E7%B5%90%E6%9E%9C%E5%B7%B2%E9%81%B8%E4%B8%AD%EF%BC%8C%E9%BB%9E%E6%93%8A%E7%A2%BA%E5%AE%9A%E9%97%9C%E9%96%8B%E3%80%82",jsonResult);}const%20closeButton=document.querySelector(CLOSE_SELECTOR);if(closeButton){await%20sleep(100);closeButton.click();}return%20results;}runScoreExtractor("multiplayerSendButton");}`}();
                                    </code>
                                </div>
                                <ol start={3} style={{ marginLeft: '1.25rem', marginBottom: '0.75rem' }}>
                                    <li style={{ marginBottom: '0.5rem' }}>
                                        On the Open Guessr results page, click the bookmark
                                    </li>
                                    <li style={{ marginBottom: '0.5rem' }}>
                                        The scores will be automatically copied to your clipboard
                                    </li>
                                    <li>
                                        Paste them into the textarea above and click "Import Scores"
                                    </li>
                                </ol>
                                <p style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    fontStyle: 'italic',
                                    marginTop: '0.75rem'
                                }}>
                                    Last updated: 2025-11-23
                                </p>
                            </div>
                        )}
                    </div>

                    <textarea
                        className="input"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"name": "GuestPanda", "point": "26"}, {"name": "GuestKangaroo", "point": "26"}]'
                        rows={4}
                        style={{
                            width: '100%',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            marginBottom: '0.75rem',
                            resize: 'vertical'
                        }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={handleJsonPaste}
                            className="btn btn-outline"
                            disabled={!jsonInput.trim()}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <FileJson size={18} />
                            Import Scores
                        </button>

                        <button
                            type="button"
                            onClick={handleJsonPasteAndSave}
                            className="btn btn-primary"
                            disabled={!jsonInput.trim() || isSubmitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Save size={18} />
                            Import & Save
                        </button>

                        {jsonMessage && (
                            <span style={{
                                color: jsonMessage.type === 'success' ? '#4ade80' : '#f87171',
                                fontSize: '0.9rem'
                            }}>
                                {jsonMessage.text}
                            </span>
                        )}
                    </div>
                </div>

                <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Previous Total</th>
                                <th>New Total Score</th>
                                <th style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <span>Rejoin?</span>
                                        <input
                                            type="checkbox"
                                            checked={allRejoinsSelected}
                                            onChange={toggleAllRejoins}
                                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            title="Select All"
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(p => (
                                <tr key={p.competitionPlayerId}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td style={{ color: '#94a3b8' }}>
                                        {p.currentTotal !== null ? p.currentTotal.toLocaleString() : '-'}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="input"
                                            style={{ width: '120px' }}
                                            value={inputs[p.competitionPlayerId]}
                                            onChange={(e) => handleScoreChange(p.competitionPlayerId, e.target.value)}
                                            placeholder="Total Score"
                                            required
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={rejoins[p.competitionPlayerId] || false}
                                            onChange={() => toggleRejoin(p.competitionPlayerId)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <Link href={`/competitions/${competitionId}`} className="btn btn-outline">Cancel</Link>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <Save size={18} />
                                Save Scores
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: '#1e293b',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '90%',
                        border: '1px solid #334155',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#f8fafc' }}>
                            Confirm Zero Scores
                        </h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            It seems that no scores have changed from the previous round (all players have 0 points added).
                            <br /><br />
                            Are you sure you want to save these scores?
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleCancelConfirm}
                                className="btn btn-outline"
                                style={{ backgroundColor: 'transparent' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmZeroScores}
                                className="btn btn-primary"
                            >
                                Yes, Save 0 Scores
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
