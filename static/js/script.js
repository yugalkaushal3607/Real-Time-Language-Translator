document.addEventListener("DOMContentLoaded", function () {

    // ==============================
    // GET HTML ELEMENTS
    // ==============================

    const originalText = document.getElementById("originalText");
    const translatedText = document.getElementById("translatedText");

    const sourceLanguage = document.getElementById("sourceLanguage");
    const targetLanguage = document.getElementById("targetLanguage");

    const recordBtn = document.getElementById("recordBtn");
    const translateBtn = document.getElementById("translateBtn");
    const speakBtn = document.getElementById("speakBtn");
    const clearBtn = document.getElementById("clearBtn");

    const status = document.getElementById("status");


    // ==============================
    // CHECK REQUIRED ELEMENTS
    // ==============================

    if (
        !originalText ||
        !translatedText ||
        !sourceLanguage ||
        !targetLanguage ||
        !recordBtn ||
        !translateBtn ||
        !speakBtn ||
        !clearBtn ||
        !status
    ) {

        console.error("Some HTML elements are missing.");

        return;
    }


    // ==============================
    // SPEECH RECOGNITION
    // ==============================

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;
    let isRecording = false;


    const speechLanguages = {

        "en": "en-US",
        "hi": "hi-IN",
        "fr": "fr-FR",
        "es": "es-ES",
        "de": "de-DE",
        "it": "it-IT",
        "ja": "ja-JP",
        "zh-CN": "zh-CN",
        "ar": "ar-SA",
        "ru": "ru-RU",
        "pt": "pt-PT",
        "bn": "bn-IN",
        "pa": "pa-IN",
        "ur": "ur-PK",
        "ko": "ko-KR",
        "ta": "ta-IN",
        "te": "te-IN",
        "mr": "mr-IN"
    };


    // ==============================
    // MICROPHONE
    // ==============================

    recordBtn.addEventListener("click", function () {

        if (!SpeechRecognition) {

            status.textContent =
                "Speech recognition is not supported. Please use Chrome.";

            return;
        }


        if (isRecording) {

            recognition.stop();

            return;
        }


        recognition = new SpeechRecognition();

        recognition.lang =
            speechLanguages[sourceLanguage.value] || "en-US";

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;


        recognition.onstart = function () {

            isRecording = true;

            recordBtn.textContent = "⏹ Stop Recording";

            status.textContent =
                "🎤 Listening... Speak now.";

        };


        recognition.onresult = function (event) {

            const speechText =
                event.results[0][0].transcript;

            originalText.value = speechText;

            status.textContent =
                "✅ Speech converted to text.";

        };


        recognition.onerror = function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            if (event.error === "not-allowed") {

                status.textContent =
                    "❌ Microphone permission denied.";

            }

            else if (event.error === "no-speech") {

                status.textContent =
                    "❌ No speech detected. Please speak again.";

            }

            else {

                status.textContent =
                    "❌ Microphone error: " + event.error;
            }

        };


        recognition.onend = function () {

            isRecording = false;

            recordBtn.textContent =
                "🎤 Start Recording";

        };


        recognition.start();

    });


    // ==============================
    // CHANGE SOURCE LANGUAGE
    // ==============================

    sourceLanguage.addEventListener("change", function () {

        if (isRecording && recognition) {

            recognition.stop();
        }

        status.textContent =
            "Source language changed.";

    });


    // ==============================
    // TRANSLATE
    // ==============================

    translateBtn.addEventListener("click", async function () {

        const text =
            originalText.value.trim();

        const source =
            sourceLanguage.value;

        const target =
            targetLanguage.value;


        if (!text) {

            status.textContent =
                "⚠️ Please enter text or use the microphone.";

            return;
        }


        if (source === target) {

            translatedText.value = text;

            status.textContent =
                "Source and target languages are the same.";

            return;
        }


        status.textContent =
            "⏳ Translating...";

        translateBtn.disabled = true;


        try {

            const response = await fetch("/translate", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    text: text,
                    source: source,
                    target: target

                })

            });


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error || "Translation failed."
                );
            }


            translatedText.value =
                data.translated_text;


            status.textContent =
                "✅ Translation completed.";

        }

        catch (error) {

            console.error(error);

            status.textContent =
                "❌ " + error.message;

        }

        finally {

            translateBtn.disabled = false;

        }

    });


    // ==============================
    // SPEAK TRANSLATION
    // ==============================

    speakBtn.addEventListener("click", async function () {

        const text =
            translatedText.value.trim();


        if (!text) {

            status.textContent =
                "⚠️ Translate something first.";

            return;
        }


        status.textContent =
            "🔊 Generating voice...";

        speakBtn.disabled = true;


        try {

            const response = await fetch("/speak", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    text: text,
                    language: targetLanguage.value

                })

            });


            if (!response.ok) {

                const data =
                    await response.json();

                throw new Error(
                    data.error || "Audio generation failed."
                );
            }


            const audioBlob =
                await response.blob();


            const audioURL =
                URL.createObjectURL(audioBlob);


            const audio =
                new Audio(audioURL);


            audio.onended = function () {

                URL.revokeObjectURL(audioURL);

                speakBtn.disabled = false;

                status.textContent =
                    "✅ Audio finished.";

            };


            await audio.play();

            status.textContent =
                "🔊 Playing translation...";

        }

        catch (error) {

            console.error(error);

            status.textContent =
                "❌ " + error.message;

            speakBtn.disabled = false;

        }

    });


    // ==============================
    // CLEAR
    // ==============================

    clearBtn.addEventListener("click", function () {

        if (isRecording && recognition) {

            recognition.stop();
        }


        originalText.value = "";

        translatedText.value = "";

        status.textContent =
            "Ready to translate.";

    });

});