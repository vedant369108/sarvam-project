// Sarvam Indic Studio Client Logic
document.addEventListener("DOMContentLoaded", () => {
    // Language Code to Display Name Mapping
    const LANGUAGE_NAMES = {
        "auto": "✨ Auto Detect",
        "unknown": "Auto Detect (Speech)",
        "en-IN": "English",
        "hi-IN": "Hindi (हिन्दी)",
        "bn-IN": "Bengali (বাংলা)",
        "mr-IN": "Marathi (मराठी)",
        "te-IN": "Telugu (తెలుగు)",
        "ta-IN": "Tamil (தமிழ்)",
        "gu-IN": "Gujarati (ગુજરાતી)",
        "ur-IN": "Urdu (اردو)",
        "kn-IN": "Kannada (ಕನ್ನಡ)",
        "od-IN": "Odia (ଓଡ଼ିଆ)",
        "ml-IN": "Malayalam (മലയാളം)",
        "pa-IN": "Punjabi (ਪੰਜਾਬੀ)",
        "as-IN": "Assamese (অসমীয়া)",
        "mai-IN": "Maithili (मैथिली)",
        "sa-IN": "Sanskrit (संस्कृतम्)",
        "ne-IN": "Nepali (नेपाली)",
        "kok-IN": "Konkani (कोंकणी)",
        "sd-IN": "Sindhi (سنڌي)",
        "doi-IN": "Dogri (डोगरी)",
        "ks-IN": "Kashmiri (कॉशुर)",
        "brx-IN": "Bodo (बड़ो)",
        "sat-IN": "Santhali (ᱥᱟᱱᱛᱟᱲᱤ)",
        "mni-IN": "Manipuri (মৈতৈलोन्)"
    };

    const SCRIPT_NAMES = {
        "Deva": "Devanagari (देवनागरी)",
        "Beng": "Bengali-Assamese (বাংলা)",
        "Taml": "Tamil (தமிழ்)",
        "Telu": "Telugu (తెలుగు)",
        "Gujr": "Gujarati (ગુજરાતી)",
        "Knda": "Kannada (ಕನ್ನಡ)",
        "Mlym": "Malayalam (മലയാളം)",
        "Guru": "Gurmukhi (ਗੁਰਮੁਖੀ)",
        "Orya": "Odia (ଓଡ଼ିଆ)",
        "Arab": "Perso-Arabic (عربی)",
        "Latn": "Latin / Roman",
        "Olck": "Ol Chiki (ᱥᱟᱱᱛᱟᱲᱤ)"
    };

    // DOM Elements - Theme & Tabs
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const viewPanels = document.querySelectorAll(".view-panel");

    // Translation DOM Elements
    const sourceLangSelect = document.getElementById("source-lang-select");
    const targetLangSelect = document.getElementById("target-lang-select");
    const swapLangBtn = document.getElementById("swap-lang-btn");
    const sourceInput = document.getElementById("source-input");
    const targetOutput = document.getElementById("target-output");
    const targetPlaceholder = document.getElementById("target-placeholder");
    const loadingSpinner = document.getElementById("loading-spinner");
    const translateBtn = document.getElementById("translate-btn");
    const charCounter = document.getElementById("char-counter");
    const targetCharCounter = document.getElementById("target-char-counter");
    const latencyBadge = document.getElementById("latency-badge");
    const copyBtn = document.getElementById("copy-btn");
    const copyBtnText = document.getElementById("copy-btn-text");
    const speakBtn = document.getElementById("speak-btn");
    const clearBtn = document.getElementById("clear-btn");
    const pasteBtn = document.getElementById("paste-btn");
    const targetDisplayTitle = document.getElementById("target-display-title");
    const modelTagBadge = document.getElementById("model-tag-badge");

    // Voice Input in Translation Editor
    const micQuickBtn = document.getElementById("mic-quick-btn");
    const micQuickText = document.getElementById("mic-quick-text");
    const audioUploadTriggerBtn = document.getElementById("audio-upload-trigger-btn");
    const sourceAudioFile = document.getElementById("source-audio-file");

    // Advanced Model Settings
    const toggleSettingsBtn = document.getElementById("toggle-settings-btn");
    const advancedSettingsCard = document.querySelector(".advanced-settings-card");
    const modelChoice = document.getElementById("model-choice");
    const modeChoice = document.getElementById("mode-choice");
    const genderChoice = document.getElementById("gender-choice");
    const numeralsChoice = document.getElementById("numerals-choice");
    const scriptChoice = document.getElementById("script-choice");
    const outputScriptGroup = document.getElementById("output-script-group");

    // STT Dedicated Studio DOM Elements
    const sttMicMainBtn = document.getElementById("stt-mic-main-btn");
    const sttRecordingWaves = document.getElementById("stt-recording-waves");
    const sttMicStatus = document.getElementById("stt-mic-status");
    const sttRecordingTimer = document.getElementById("stt-recording-timer");
    const sttDropZone = document.getElementById("stt-drop-zone");
    const sttFileInput = document.getElementById("stt-file-input");
    const sttSelectedFile = document.getElementById("stt-selected-file");
    const sttUploadTranscribeBtn = document.getElementById("stt-upload-transcribe-btn");
    const sttTranscriptOutput = document.getElementById("stt-transcript-output");
    const sttDetectedLangBadge = document.getElementById("stt-detected-lang-badge");
    const sttSpinner = document.getElementById("stt-spinner");
    const sttCopyBtn = document.getElementById("stt-copy-btn");
    const sttSendToTranslateBtn = document.getElementById("stt-send-to-translate-btn");

    // Transliteration DOM Elements
    const translitSourceSelect = document.getElementById("translit-source-select");
    const translitTargetSelect = document.getElementById("translit-target-select");
    const translitInput = document.getElementById("translit-input");
    const translitOutput = document.getElementById("translit-output");
    const transliterateBtn = document.getElementById("transliterate-btn");
    const translitCopyBtn = document.getElementById("translit-copy-btn");

    // Identification DOM Elements
    const identifyInput = document.getElementById("identify-input");
    const identifyBtn = document.getElementById("identify-btn");
    const identifyResultCard = document.getElementById("identify-result-card");
    const detectLangName = document.getElementById("detect-lang-name");
    const detectLangCode = document.getElementById("detect-lang-code");
    const detectScriptName = document.getElementById("detect-script-name");
    const detectScriptCode = document.getElementById("detect-script-code");

    // History DOM Elements
    const historyList = document.getElementById("history-list");
    const clearHistoryBtn = document.getElementById("clear-history-btn");

    // Toast
    const toast = document.getElementById("toast");

    // Health check on load
    fetch("/api/health")
        .then(r => r.json())
        .then(data => {
            const badge = document.getElementById("api-status-badge");
            if (data.sarvam_connected) {
                badge.querySelector(".status-label").textContent = "Sarvam AI Connected";
            } else {
                badge.querySelector(".status-label").textContent = "API Key Missing";
                badge.style.color = "#f87171";
            }
        })
        .catch(() => {});

    // Theme Management
    const savedTheme = localStorage.getItem("sarvam_theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
    }

    themeToggleBtn.addEventListener("click", () => {
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            localStorage.setItem("sarvam_theme", "light");
        } else {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            localStorage.setItem("sarvam_theme", "dark");
        }
    });

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            viewPanels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const targetView = document.getElementById(`view-${btn.dataset.tab}`);
            if (targetView) {
                targetView.classList.add("active");
            }
            if (btn.dataset.tab === "history") {
                renderHistory();
            }
        });
    });

    // Advanced Settings Toggle
    toggleSettingsBtn.addEventListener("click", () => {
        advancedSettingsCard.classList.toggle("open");
    });

    modelChoice.addEventListener("change", () => {
        const model = modelChoice.value;
        modelTagBadge.textContent = model;
        if (model === "sarvam-translate:v1") {
            outputScriptGroup.style.opacity = "0.5";
            scriptChoice.disabled = true;
        } else {
            outputScriptGroup.style.opacity = "1";
            scriptChoice.disabled = false;
        }
    });

    targetLangSelect.addEventListener("change", () => {
        const langName = LANGUAGE_NAMES[targetLangSelect.value] || targetLangSelect.value;
        targetDisplayTitle.textContent = `${langName} Translation`;
    });

    // Character Counter
    sourceInput.addEventListener("input", updateCharCounter);
    function updateCharCounter() {
        const val = sourceInput.value;
        const chars = val.length;
        const words = val.trim() ? val.trim().split(/\s+/).length : 0;
        charCounter.textContent = `${chars} chars • ${words} words`;
    }

    // Language Swap
    swapLangBtn.addEventListener("click", () => {
        const src = sourceLangSelect.value;
        const tgt = targetLangSelect.value;

        if (src === "auto") {
            showToast("Cannot swap when Auto Detect is active.");
            return;
        }

        sourceLangSelect.value = tgt;
        targetLangSelect.value = src;
        targetDisplayTitle.textContent = `${LANGUAGE_NAMES[src] || src} Translation`;

        const curSourceText = sourceInput.value;
        const curTargetText = targetOutput.textContent;

        if (curTargetText && !targetOutput.classList.contains("hidden")) {
            sourceInput.value = curTargetText;
            targetOutput.textContent = curSourceText;
            updateCharCounter();
            executeTranslation();
        }
    });

    // Clear Button
    clearBtn.addEventListener("click", () => {
        sourceInput.value = "";
        targetOutput.textContent = "";
        targetOutput.classList.add("hidden");
        targetPlaceholder.classList.remove("hidden");
        copyBtn.disabled = true;
        speakBtn.disabled = true;
        updateCharCounter();
        targetCharCounter.textContent = "0 chars";
        latencyBadge.textContent = "Ready";
        sourceInput.focus();
    });

    // Paste Button
    pasteBtn.addEventListener("click", async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                sourceInput.value = text;
                updateCharCounter();
                showToast("Pasted from clipboard");
            }
        } catch {
            showToast("Clipboard access denied");
        }
    });

    // Copy Translation
    copyBtn.addEventListener("click", () => {
        const text = targetOutput.textContent;
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            copyBtnText.textContent = "Copied!";
            showToast("Copied translation to clipboard!");
            setTimeout(() => {
                copyBtnText.textContent = "Copy";
            }, 2000);
        });
    });

    // Text to Speech
    speakBtn.addEventListener("click", () => {
        const text = targetOutput.textContent;
        if (!text || !('speechSynthesis' in window)) {
            showToast("Speech synthesis not supported in this browser.");
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = targetLangSelect.value;
        utterance.lang = langCode;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
        showToast(`Playing audio (${LANGUAGE_NAMES[langCode] || langCode})`);
    });

    // Sample Chips
    document.querySelectorAll(".chip-btn").forEach(chip => {
        chip.addEventListener("click", () => {
            sourceInput.value = chip.dataset.text;
            updateCharCounter();
            executeTranslation();
        });
    });

    // Keyboard Shortcut (Ctrl+Enter or Cmd+Enter)
    sourceInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            executeTranslation();
        }
    });

    translateBtn.addEventListener("click", executeTranslation);

    // Main Translation Function
    async function executeTranslation() {
        const text = sourceInput.value.trim();
        if (!text) {
            showToast("Please enter text to translate.");
            sourceInput.focus();
            return;
        }

        const payload = {
            input: text,
            source_language_code: sourceLangSelect.value,
            target_language_code: targetLangSelect.value,
            model: modelChoice.value,
            mode: modeChoice.value,
            speaker_gender: genderChoice.value || null,
            numerals_format: numeralsChoice.value || null
        };

        if (modelChoice.value === "mayura:v1") {
            payload.output_script = scriptChoice.value;
        }

        loadingSpinner.classList.remove("hidden");
        targetPlaceholder.classList.add("hidden");
        translateBtn.disabled = true;
        const startTime = performance.now();

        try {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            const elapsed = Math.round(performance.now() - startTime);

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Translation request failed");
            }

            targetOutput.textContent = data.translated_text;
            targetOutput.classList.remove("hidden");
            targetCharCounter.textContent = `${data.translated_text.length} chars`;
            latencyBadge.textContent = `⚡ Translated in ${elapsed}ms via ${data.model_used}`;

            copyBtn.disabled = false;
            speakBtn.disabled = false;

            saveToHistory({
                sourceText: text,
                translatedText: data.translated_text,
                sourceLang: sourceLangSelect.value,
                targetLang: targetLangSelect.value,
                model: data.model_used,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

        } catch (err) {
            showToast(`Error: ${err.message}`);
            targetPlaceholder.classList.remove("hidden");
        } finally {
            loadingSpinner.classList.add("hidden");
            translateBtn.disabled = false;
        }
    }

    // ==========================================
    // SPEECH TO TEXT (SAARAS STT) IMPLEMENTATION
    // ==========================================
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    let activeMicSource = null; // 'quick' or 'main'
    let timerInterval = null;
    let recordingStartTime = 0;

    // Helper: Convert audio blob to base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                resolve(base64data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Helper: Call STT API
    async function transcribeAudio(blob, mimeType) {
        const base64 = await blobToBase64(blob);
        const res = await fetch("/api/speech-to-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                audio_base64: base64,
                mime_type: mimeType || "audio/webm",
                model: "saaras:v3",
                language_code: "unknown"
            })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || "Speech-to-text failed");
        }
        return data;
    }

    // Start Recording from Microphone
    async function startRecording(source) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            activeMicSource = source;

            // Pick supported mime type
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
            }

            mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                clearInterval(timerInterval);

                const audioBlob = new Blob(audioChunks, { type: mimeType });
                handleRecordingFinished(audioBlob, mimeType, activeMicSource);
            };

            mediaRecorder.start();
            isRecording = true;
            recordingStartTime = Date.now();

            if (source === 'quick') {
                micQuickBtn.classList.add('recording');
                micQuickText.textContent = 'Recording... (Stop)';
                showToast("🎙️ Listening... Speak in any Indian language or English");
            } else {
                sttMicMainBtn.classList.add('recording');
                sttRecordingWaves.classList.remove('hidden');
                sttMicStatus.textContent = 'Listening... Speak now';
                sttRecordingTimer.classList.remove('hidden');
                timerInterval = setInterval(updateTimerDisplay, 500);
            }

        } catch (err) {
            showToast("Microphone access error: " + err.message);
            stopRecordingUI();
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            stopRecordingUI();
        }
    }

    function stopRecordingUI() {
        isRecording = false;
        micQuickBtn.classList.remove('recording');
        micQuickText.textContent = 'Voice Input';
        sttMicMainBtn.classList.remove('recording');
        sttRecordingWaves.classList.add('hidden');
        sttRecordingTimer.classList.add('hidden');
        sttMicStatus.textContent = 'Processing speech via Sarvam Saaras AI...';
        clearInterval(timerInterval);
    }

    function updateTimerDisplay() {
        const diff = Math.floor((Date.now() - recordingStartTime) / 1000);
        const mins = String(Math.floor(diff / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        sttRecordingTimer.textContent = `${mins}:${secs}`;
    }

    async function handleRecordingFinished(blob, mimeType, source) {
        if (source === 'quick') {
            loadingSpinner.classList.remove("hidden");
            document.getElementById("loading-text-msg").textContent = "Transcribing your voice via Sarvam Saaras AI...";
            try {
                const data = await transcribeAudio(blob, mimeType);
                if (data.transcript) {
                    sourceInput.value = data.transcript;
                    updateCharCounter();
                    showToast(`🎙️ Transcribed (${LANGUAGE_NAMES[data.detected_language_code] || data.detected_language_code})`);
                    executeTranslation();
                } else {
                    showToast("No speech detected. Please speak closer to the microphone.");
                }
            } catch (err) {
                showToast("STT Error: " + err.message);
            } finally {
                loadingSpinner.classList.add("hidden");
                document.getElementById("loading-text-msg").textContent = "Generating translation via Sarvam AI...";
            }
        } else {
            sttSpinner.classList.remove("hidden");
            try {
                const data = await transcribeAudio(blob, mimeType);
                sttTranscriptOutput.textContent = data.transcript || "(No speech detected)";
                sttTranscriptOutput.classList.remove("empty");
                if (data.detected_language_code) {
                    sttDetectedLangBadge.textContent = `Detected: ${LANGUAGE_NAMES[data.detected_language_code] || data.detected_language_code}`;
                    sttDetectedLangBadge.classList.remove("hidden");
                }
                sttCopyBtn.disabled = !data.transcript;
                sttSendToTranslateBtn.disabled = !data.transcript;
                sttMicStatus.textContent = "Transcription complete!";
            } catch (err) {
                showToast("STT Error: " + err.message);
                sttMicStatus.textContent = "Error during transcription";
            } finally {
                sttSpinner.classList.add("hidden");
            }
        }
    }

    // Toggle Mic buttons
    micQuickBtn.addEventListener("click", () => {
        if (isRecording) stopRecording();
        else startRecording('quick');
    });

    sttMicMainBtn.addEventListener("click", () => {
        if (isRecording) stopRecording();
        else startRecording('main');
    });

    // Upload Audio in Source Translation Editor
    audioUploadTriggerBtn.addEventListener("click", () => {
        sourceAudioFile.click();
    });

    sourceAudioFile.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showToast(`Uploading ${file.name} to Sarvam Saaras STT...`);
        loadingSpinner.classList.remove("hidden");
        document.getElementById("loading-text-msg").textContent = `Transcribing ${file.name}...`;

        try {
            const data = await transcribeAudio(file, file.type || "audio/wav");
            if (data.transcript) {
                sourceInput.value = data.transcript;
                updateCharCounter();
                showToast(`🎙️ File transcribed (${LANGUAGE_NAMES[data.detected_language_code] || data.detected_language_code})`);
                executeTranslation();
            } else {
                showToast("No speech detected in audio file.");
            }
        } catch (err) {
            showToast("STT Error: " + err.message);
        } finally {
            loadingSpinner.classList.add("hidden");
            document.getElementById("loading-text-msg").textContent = "Generating translation via Sarvam AI...";
            sourceAudioFile.value = "";
        }
    });

    // Dedicated STT File Drop Zone
    let sttSelectedAudioFile = null;

    sttDropZone.addEventListener("click", () => sttFileInput.click());
    sttDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        sttDropZone.classList.add("dragover");
    });
    sttDropZone.addEventListener("dragleave", () => sttDropZone.classList.remove("dragover"));
    sttDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        sttDropZone.classList.remove("dragover");
        if (e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    sttFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    function handleFileSelection(file) {
        sttSelectedAudioFile = file;
        sttSelectedFile.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        sttSelectedFile.classList.remove("hidden");
        sttUploadTranscribeBtn.disabled = false;
    }

    sttUploadTranscribeBtn.addEventListener("click", async () => {
        if (!sttSelectedAudioFile) return;

        sttSpinner.classList.remove("hidden");
        sttUploadTranscribeBtn.disabled = true;

        try {
            const data = await transcribeAudio(sttSelectedAudioFile, sttSelectedAudioFile.type || "audio/wav");
            sttTranscriptOutput.textContent = data.transcript || "(No speech detected)";
            sttTranscriptOutput.classList.remove("empty");
            if (data.detected_language_code) {
                sttDetectedLangBadge.textContent = `Detected: ${LANGUAGE_NAMES[data.detected_language_code] || data.detected_language_code}`;
                sttDetectedLangBadge.classList.remove("hidden");
            }
            sttCopyBtn.disabled = !data.transcript;
            sttSendToTranslateBtn.disabled = !data.transcript;
            showToast("Transcription successful!");
        } catch (err) {
            showToast("STT Error: " + err.message);
        } finally {
            sttSpinner.classList.add("hidden");
            sttUploadTranscribeBtn.disabled = false;
        }
    });

    sttCopyBtn.addEventListener("click", () => {
        const text = sttTranscriptOutput.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => showToast("Copied transcript!"));
    });

    sttSendToTranslateBtn.addEventListener("click", () => {
        const text = sttTranscriptOutput.textContent;
        if (!text) return;

        document.querySelector('[data-tab="translate"]').click();
        sourceInput.value = text;
        updateCharCounter();
        executeTranslation();
        showToast("Sent transcript to Translation Studio!");
    });

    // ==========================================
    // TRANSLITERATION & DETECTION
    // ==========================================
    document.querySelectorAll(".chip-translit-btn").forEach(chip => {
        chip.addEventListener("click", () => {
            translitInput.value = chip.dataset.text;
            executeTransliterate();
        });
    });

    transliterateBtn.addEventListener("click", executeTransliterate);

    async function executeTransliterate() {
        const text = translitInput.value.trim();
        if (!text) {
            showToast("Please enter phonetic text to transliterate.");
            return;
        }

        translitOutput.textContent = "Converting script...";
        translitOutput.classList.remove("empty");
        transliterateBtn.disabled = true;

        try {
            const res = await fetch("/api/transliterate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: text,
                    source_language_code: translitSourceSelect.value,
                    target_language_code: translitTargetSelect.value
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Transliteration failed");
            }

            translitOutput.textContent = data.transliterated_text;
            translitCopyBtn.disabled = false;
        } catch (err) {
            showToast(`Error: ${err.message}`);
            translitOutput.textContent = "Error during transliteration.";
        } finally {
            transliterateBtn.disabled = false;
        }
    }

    translitCopyBtn.addEventListener("click", () => {
        const text = translitOutput.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            showToast("Copied transliterated text!");
        });
    });

    // Language Identification Studio
    document.querySelectorAll(".chip-identify-btn").forEach(chip => {
        chip.addEventListener("click", () => {
            identifyInput.value = chip.dataset.text;
            executeIdentify();
        });
    });

    identifyBtn.addEventListener("click", executeIdentify);

    async function executeIdentify() {
        const text = identifyInput.value.trim();
        if (!text) {
            showToast("Please enter text to identify.");
            return;
        }

        identifyBtn.disabled = true;

        try {
            const res = await fetch("/api/identify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input: text })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Language identification failed");
            }

            detectLangName.textContent = LANGUAGE_NAMES[data.language_code] || data.language_code;
            detectLangCode.textContent = `Code: ${data.language_code}`;
            detectScriptName.textContent = SCRIPT_NAMES[data.script_code] || data.script_code;
            detectScriptCode.textContent = `ISO Script: ${data.script_code}`;

            identifyResultCard.classList.remove("hidden");
        } catch (err) {
            showToast(`Error: ${err.message}`);
        } finally {
            identifyBtn.disabled = false;
        }
    }

    // History Storage Helpers
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem("sarvam_history") || "[]");
        } catch {
            return [];
        }
    }

    function saveToHistory(item) {
        let history = getHistory();
        history.unshift(item);
        if (history.length > 25) history = history.slice(0, 25);
        localStorage.setItem("sarvam_history", JSON.stringify(history));
    }

    function renderHistory() {
        const history = getHistory();
        if (!history.length) {
            historyList.innerHTML = `<div class="empty-history">No translations recorded yet. Try translating some sentences!</div>`;
            return;
        }

        historyList.innerHTML = history.map((item, idx) => `
            <div class="history-item" data-index="${idx}">
                <div class="history-content">
                    <div class="history-meta">
                        <span class="history-lang-tag">${LANGUAGE_NAMES[item.sourceLang] || item.sourceLang} → ${LANGUAGE_NAMES[item.targetLang] || item.targetLang}</span>
                        <span>•</span>
                        <span>${item.time}</span>
                        <span>•</span>
                        <span>${item.model}</span>
                    </div>
                    <div class="history-text-preview"><strong>${escapeHtml(item.sourceText)}</strong></div>
                    <div class="history-text-preview" style="color: var(--text-secondary); margin-top: 2px;">${escapeHtml(item.translatedText)}</div>
                </div>
                <button class="mini-btn" title="Restore to editor">Restore ↗</button>
            </div>
        `).join("");

        document.querySelectorAll(".history-item").forEach(el => {
            el.addEventListener("click", () => {
                const idx = parseInt(el.dataset.index, 10);
                const item = history[idx];
                if (!item) return;

                document.querySelector('[data-tab="translate"]').click();
                sourceLangSelect.value = item.sourceLang;
                targetLangSelect.value = item.targetLang;
                sourceInput.value = item.sourceText;
                targetOutput.textContent = item.translatedText;
                targetOutput.classList.remove("hidden");
                targetPlaceholder.classList.add("hidden");
                copyBtn.disabled = false;
                speakBtn.disabled = false;
                updateCharCounter();
                targetCharCounter.textContent = `${item.translatedText.length} chars`;
                showToast("Restored from history!");
            });
        });
    }

    clearHistoryBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your translation history?")) {
            localStorage.removeItem("sarvam_history");
            renderHistory();
            showToast("History cleared.");
        }
    });

    // Toast Utility
    let toastTimeout;
    function showToast(msg) {
        clearTimeout(toastTimeout);
        toast.textContent = msg;
        toast.classList.remove("hidden");
        toastTimeout = setTimeout(() => {
            toast.classList.add("hidden");
        }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
});
