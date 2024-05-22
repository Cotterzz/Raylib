var Module = (() => {
    var _scriptName = import.meta.url;
    return function(moduleArg = {}) {
        var moduleRtn, Module = Object.assign({}, moduleArg),
            readyPromiseResolve, readyPromiseReject, readyPromise = new Promise((r, t) => {
                readyPromiseResolve = r, readyPromiseReject = t
            }),
            ENVIRONMENT_IS_WEB = !0,
            moduleOverrides = Object.assign({}, Module),
            quit_ = (r, t) => {
                throw t
            },
            scriptDirectory = "";

        function locateFile(r) {
            return Module.locateFile ? Module.locateFile(r, scriptDirectory) : scriptDirectory + r
        }
        var read_, readAsync;
        typeof document < "u" && document.currentScript && (scriptDirectory = document.currentScript.src), _scriptName && (scriptDirectory = _scriptName), scriptDirectory.startsWith("blob:") ? scriptDirectory = "" : scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1), read_ = r => {
            var t = new XMLHttpRequest;
            return t.open("GET", r, !1), t.send(null), t.responseText
        }, readAsync = (r, t, n) => {
            var e = new XMLHttpRequest;
            e.open("GET", r, !0), e.responseType = "arraybuffer", e.onload = () => {
                if (e.status == 200 || e.status == 0 && e.response) {
                    t(e.response);
                    return
                }
                n()
            }, e.onerror = n, e.send(null)
        };
        var out = Module.print || console.log.bind(console),
            err = Module.printErr || console.error.bind(console);
        Object.assign(Module, moduleOverrides), moduleOverrides = null, Module.arguments && Module.arguments, Module.thisProgram && Module.thisProgram, Module.quit && (quit_ = Module.quit);
        var wasmBinary;
        Module.wasmBinary && (wasmBinary = Module.wasmBinary);
        var wasmMemory, ABORT = !1,
            EXITSTATUS, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

        function updateMemoryViews() {
            var r = wasmMemory.buffer;
            Module.HEAP8 = HEAP8 = new Int8Array(r), Module.HEAP16 = HEAP16 = new Int16Array(r), Module.HEAPU8 = HEAPU8 = new Uint8Array(r), Module.HEAPU16 = HEAPU16 = new Uint16Array(r), Module.HEAP32 = HEAP32 = new Int32Array(r), Module.HEAPU32 = HEAPU32 = new Uint32Array(r), Module.HEAPF32 = HEAPF32 = new Float32Array(r), Module.HEAPF64 = HEAPF64 = new Float64Array(r)
        }
        var __ATPRERUN__ = [],
            __ATINIT__ = [],
            __ATPOSTRUN__ = [];

        function preRun() {
            if (Module.preRun)
                for (typeof Module.preRun == "function" && (Module.preRun = [Module.preRun]); Module.preRun.length;) addOnPreRun(Module.preRun.shift());
            callRuntimeCallbacks(__ATPRERUN__)
        }

        function initRuntime() {
            !Module.noFSInit && !FS.init.initialized && FS.init(), FS.ignorePermissions = !1, callRuntimeCallbacks(__ATINIT__)
        }

        function postRun() {
            if (Module.postRun)
                for (typeof Module.postRun == "function" && (Module.postRun = [Module.postRun]); Module.postRun.length;) addOnPostRun(Module.postRun.shift());
            callRuntimeCallbacks(__ATPOSTRUN__)
        }

        function addOnPreRun(r) {
            __ATPRERUN__.unshift(r)
        }

        function addOnInit(r) {
            __ATINIT__.unshift(r)
        }

        function addOnPostRun(r) {
            __ATPOSTRUN__.unshift(r)
        }
        var runDependencies = 0,
            dependenciesFulfilled = null;

        function getUniqueRunDependency(r) {
            return r
        }

        function addRunDependency(r) {
            var t;
            runDependencies++, (t = Module.monitorRunDependencies) == null || t.call(Module, runDependencies)
        }

        function removeRunDependency(r) {
            var n;
            if (runDependencies--, (n = Module.monitorRunDependencies) == null || n.call(Module, runDependencies), runDependencies == 0 && dependenciesFulfilled) {
                var t = dependenciesFulfilled;
                dependenciesFulfilled = null, t()
            }
        }

        function abort(r) {
            var n;
            (n = Module.onAbort) == null || n.call(Module, r), r = "Aborted(" + r + ")", err(r), ABORT = !0, EXITSTATUS = 1, r += ". Build with -sASSERTIONS for more info.";
            var t = new WebAssembly.RuntimeError(r);
            throw readyPromiseReject(t), t
        }
        var dataURIPrefix = "data:application/octet-stream;base64,",
            isDataURI = r => r.startsWith(dataURIPrefix);

        function findWasmBinary() {
            if (Module.locateFile) {
                var r = "raylib.wasm";
                return isDataURI(r) ? r : locateFile(r)
            }
            return new URL("raylib.wasm", import.meta.url).href
        }
        var wasmBinaryFile;

        function getBinarySync(r) {
            if (r == wasmBinaryFile && wasmBinary) return new Uint8Array(wasmBinary);
            throw "both async and sync fetching of the wasm failed"
        }

        function getBinaryPromise(r) {
            return !wasmBinary && ENVIRONMENT_IS_WEB && typeof fetch == "function" ? fetch(r, {
                credentials: "same-origin"
            }).then(t => {
                if (!t.ok) throw `failed to load wasm binary file at '${r}'`;
                return t.arrayBuffer()
            }).catch(() => getBinarySync(r)) : Promise.resolve().then(() => getBinarySync(r))
        }

        function instantiateArrayBuffer(r, t, n) {
            return getBinaryPromise(r).then(e => WebAssembly.instantiate(e, t)).then(n, e => {
                err(`failed to asynchronously prepare wasm: ${e}`), abort(e)
            })
        }

        function instantiateAsync(r, t, n, e) {
            return !r && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(t) && typeof fetch == "function" ? fetch(t, {
                credentials: "same-origin"
            }).then(a => {
                var _ = WebAssembly.instantiateStreaming(a, n);
                return _.then(e, function(u) {
                    return err(`wasm streaming compile failed: ${u}`), err("falling back to ArrayBuffer instantiation"), instantiateArrayBuffer(t, n, e)
                })
            }) : instantiateArrayBuffer(t, n, e)
        }

        function getWasmImports() {
            return {
                a: wasmImports
            }
        }

        function createWasm() {
            var r = getWasmImports();

            function t(e, a) {
                return wasmExports = e.exports, wasmMemory = wasmExports.Ne, updateMemoryViews(), wasmTable = wasmExports.fh, addOnInit(wasmExports.Oe), removeRunDependency(), wasmExports
            }
            addRunDependency();

            function n(e) {
                t(e.instance)
            }
            if (Module.instantiateWasm) try {
                return Module.instantiateWasm(r, t)
            } catch (e) {
                err(`Module.instantiateWasm callback failed with error: ${e}`), readyPromiseReject(e)
            }
            return wasmBinaryFile || (wasmBinaryFile = findWasmBinary()), instantiateAsync(wasmBinary, wasmBinaryFile, r, n).catch(readyPromiseReject), {}
        }
        var tempDouble, tempI64, ASM_CONSTS = {
            93644: r => {
                navigator.clipboard.writeText(UTF8ToString(r))
            },
            93697: (r, t, n, e, a) => typeof window > "u" || (window.AudioContext || window.webkitAudioContext) === void 0 ? 0 : (typeof window.miniaudio > "u" && (window.miniaudio = {
                referenceCount: 0
            }, window.miniaudio.device_type = {}, window.miniaudio.device_type.playback = r, window.miniaudio.device_type.capture = t, window.miniaudio.device_type.duplex = n, window.miniaudio.device_state = {}, window.miniaudio.device_state.stopped = e, window.miniaudio.device_state.started = a, miniaudio.devices = [], miniaudio.track_device = function(_) {
                for (var u = 0; u < miniaudio.devices.length; ++u)
                    if (miniaudio.devices[u] == null) return miniaudio.devices[u] = _, u;
                return miniaudio.devices.push(_), miniaudio.devices.length - 1
            }, miniaudio.untrack_device_by_index = function(_) {
                for (miniaudio.devices[_] = null; miniaudio.devices.length > 0 && miniaudio.devices[miniaudio.devices.length - 1] == null;) miniaudio.devices.pop()
            }, miniaudio.untrack_device = function(_) {
                for (var u = 0; u < miniaudio.devices.length; ++u)
                    if (miniaudio.devices[u] == _) return miniaudio.untrack_device_by_index(u)
            }, miniaudio.get_device_by_index = function(_) {
                return miniaudio.devices[_]
            }, miniaudio.unlock_event_types = function() {
                return ["touchstart", "touchend", "click"]
            }(), miniaudio.unlock = function() {
                for (var _ = 0; _ < miniaudio.devices.length; ++_) {
                    var u = miniaudio.devices[_];
                    u != null && u.webaudio != null && u.state === 2 && u.webaudio.resume()
                }
                miniaudio.unlock_event_types.map(function(c) {
                    document.removeEventListener(c, miniaudio.unlock, !0)
                })
            }, miniaudio.unlock_event_types.map(function(_) {
                document.addEventListener(_, miniaudio.unlock, !0)
            })), window.miniaudio.referenceCount += 1, 1),
            95687: () => {
                typeof window.miniaudio < "u" && (window.miniaudio.referenceCount -= 1, window.miniaudio.referenceCount === 0 && delete window.miniaudio)
            },
            95851: () => navigator.mediaDevices !== void 0 && navigator.mediaDevices.getUserMedia !== void 0,
            95955: () => {
                try {
                    var r = new(window.AudioContext || window.webkitAudioContext),
                        t = r.sampleRate;
                    return r.close(), t
                } catch {
                    return 0
                }
            },
            96126: (r, t, n, e, a, _) => {
                var u = r,
                    c = t,
                    m = n,
                    M = e,
                    S = a,
                    L = _;
                if (typeof window.miniaudio > "u") return -1;
                var R = {},
                    C = {};
                u == window.miniaudio.device_type.playback && (C.sampleRate = m), R.webaudio = new(window.AudioContext || window.webkitAudioContext)(C), R.webaudio.suspend(), R.state = window.miniaudio.device_state.stopped;
                var I = 0,
                    T = c;
                return u != window.miniaudio.device_type.playback && (I = c), R.scriptNode = R.webaudio.createScriptProcessor(M, I, T), R.scriptNode.onaudioprocess = function(w) {
                    if ((R.intermediaryBufferView == null || R.intermediaryBufferView.length == 0) && (R.intermediaryBufferView = new Float32Array(Module.HEAPF32.buffer, S, M * c)), u == miniaudio.device_type.capture || u == miniaudio.device_type.duplex) {
                        for (var A = 0; A < c; A += 1)
                            for (var h = w.inputBuffer.getChannelData(A), G = R.intermediaryBufferView, O = 0; O < M; O += 1) G[O * c + A] = h[O];
                        _ma_device_process_pcm_frames_capture__webaudio(L, M, S)
                    }
                    if (u == miniaudio.device_type.playback || u == miniaudio.device_type.duplex) {
                        _ma_device_process_pcm_frames_playback__webaudio(L, M, S);
                        for (var A = 0; A < w.outputBuffer.numberOfChannels; ++A)
                            for (var D = w.outputBuffer.getChannelData(A), G = R.intermediaryBufferView, O = 0; O < M; O += 1) D[O] = G[O * c + A]
                    } else
                        for (var A = 0; A < w.outputBuffer.numberOfChannels; ++A) w.outputBuffer.getChannelData(A).fill(0)
                }, (u == miniaudio.device_type.capture || u == miniaudio.device_type.duplex) && navigator.mediaDevices.getUserMedia({
                    audio: !0,
                    video: !1
                }).then(function(w) {
                    R.streamNode = R.webaudio.createMediaStreamSource(w), R.streamNode.connect(R.scriptNode), R.scriptNode.connect(R.webaudio.destination)
                }).catch(function(w) {
                    console.log("Failed to get user media: " + w)
                }), u == miniaudio.device_type.playback && R.scriptNode.connect(R.webaudio.destination), miniaudio.track_device(R)
            },
            98909: r => miniaudio.get_device_by_index(r).webaudio.sampleRate,
            98975: r => {
                var t = miniaudio.get_device_by_index(r);
                t.scriptNode !== void 0 && (t.scriptNode.onaudioprocess = function(n) {}, t.scriptNode.disconnect(), t.scriptNode = void 0), t.streamNode !== void 0 && (t.streamNode.disconnect(), t.streamNode = void 0), t.webaudio.close(), t.webaudio = void 0
            },
            99340: r => {
                miniaudio.untrack_device_by_index(r)
            },
            99383: r => {
                var t = miniaudio.get_device_by_index(r);
                t.webaudio.resume(), t.state = miniaudio.device_state.started
            },
            99508: r => {
                var t = miniaudio.get_device_by_index(r);
                t.webaudio.suspend(), t.state = miniaudio.device_state.stopped
            }
        };

        function GetWindowInnerWidth() {
            return window.innerWidth
        }

        function GetWindowInnerHeight() {
            return window.innerHeight
        }

        function ExitStatus(r) {
            this.name = "ExitStatus", this.message = `Program terminated with exit(${r})`, this.status = r
        }
        var callRuntimeCallbacks = r => {
            for (; r.length > 0;) r.shift()(Module)
        };

        function getValue(r, t = "i8") {
            switch (t.endsWith("*") && (t = "*"), t) {
                case "i1":
                    return HEAP8[r];
                case "i8":
                    return HEAP8[r];
                case "i16":
                    return HEAP16[r >> 1];
                case "i32":
                    return HEAP32[r >> 2];
                case "i64":
                    abort("to do getValue(i64) use WASM_BIGINT");
                case "float":
                    return HEAPF32[r >> 2];
                case "double":
                    return HEAPF64[r >> 3];
                case "*":
                    return HEAPU32[r >> 2];
                default:
                    abort(`invalid type for getValue: ${t}`)
            }
        }
        var noExitRuntime = Module.noExitRuntime || !0;

        function setValue(r, t, n = "i8") {
            switch (n.endsWith("*") && (n = "*"), n) {
                case "i1":
                    HEAP8[r] = t;
                    break;
                case "i8":
                    HEAP8[r] = t;
                    break;
                case "i16":
                    HEAP16[r >> 1] = t;
                    break;
                case "i32":
                    HEAP32[r >> 2] = t;
                    break;
                case "i64":
                    abort("to do setValue(i64) use WASM_BIGINT");
                case "float":
                    HEAPF32[r >> 2] = t;
                    break;
                case "double":
                    HEAPF64[r >> 3] = t;
                    break;
                case "*":
                    HEAPU32[r >> 2] = t;
                    break;
                default:
                    abort(`invalid type for setValue: ${n}`)
            }
        }
        var stackRestore = r => __emscripten_stack_restore(r),
            stackSave = () => _emscripten_stack_get_current(),
            PATH = {
                isAbs: r => r.charAt(0) === "/",
                splitPath: r => {
                    var t = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
                    return t.exec(r).slice(1)
                },
                normalizeArray: (r, t) => {
                    for (var n = 0, e = r.length - 1; e >= 0; e--) {
                        var a = r[e];
                        a === "." ? r.splice(e, 1) : a === ".." ? (r.splice(e, 1), n++) : n && (r.splice(e, 1), n--)
                    }
                    if (t)
                        for (; n; n--) r.unshift("..");
                    return r
                },
                normalize: r => {
                    var t = PATH.isAbs(r),
                        n = r.substr(-1) === "/";
                    return r = PATH.normalizeArray(r.split("/").filter(e => !!e), !t).join("/"), !r && !t && (r = "."), r && n && (r += "/"), (t ? "/" : "") + r
                },
                dirname: r => {
                    var t = PATH.splitPath(r),
                        n = t[0],
                        e = t[1];
                    return !n && !e ? "." : (e && (e = e.substr(0, e.length - 1)), n + e)
                },
                basename: r => {
                    if (r === "/") return "/";
                    r = PATH.normalize(r), r = r.replace(/\/$/, "");
                    var t = r.lastIndexOf("/");
                    return t === -1 ? r : r.substr(t + 1)
                },
                join: (...r) => PATH.normalize(r.join("/")),
                join2: (r, t) => PATH.normalize(r + "/" + t)
            },
            initRandomFill = () => {
                if (typeof crypto == "object" && typeof crypto.getRandomValues == "function") return r => crypto.getRandomValues(r);
                abort("initRandomDevice")
            },
            randomFill = r => (randomFill = initRandomFill())(r),
            PATH_FS = {
                resolve: (...r) => {
                    for (var t = "", n = !1, e = r.length - 1; e >= -1 && !n; e--) {
                        var a = e >= 0 ? r[e] : FS.cwd();
                        if (typeof a != "string") throw new TypeError("Arguments to path.resolve must be strings");
                        if (!a) return "";
                        t = a + "/" + t, n = PATH.isAbs(a)
                    }
                    return t = PATH.normalizeArray(t.split("/").filter(_ => !!_), !n).join("/"), (n ? "/" : "") + t || "."
                },
                relative: (r, t) => {
                    r = PATH_FS.resolve(r).substr(1), t = PATH_FS.resolve(t).substr(1);

                    function n(M) {
                        for (var S = 0; S < M.length && M[S] === ""; S++);
                        for (var L = M.length - 1; L >= 0 && M[L] === ""; L--);
                        return S > L ? [] : M.slice(S, L - S + 1)
                    }
                    for (var e = n(r.split("/")), a = n(t.split("/")), _ = Math.min(e.length, a.length), u = _, c = 0; c < _; c++)
                        if (e[c] !== a[c]) {
                            u = c;
                            break
                        } for (var m = [], c = u; c < e.length; c++) m.push("..");
                    return m = m.concat(a.slice(u)), m.join("/")
                }
            },
            UTF8Decoder = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0,
            UTF8ArrayToString = (r, t, n) => {
                for (var e = t + n, a = t; r[a] && !(a >= e);) ++a;
                if (a - t > 16 && r.buffer && UTF8Decoder) return UTF8Decoder.decode(r.subarray(t, a));
                for (var _ = ""; t < a;) {
                    var u = r[t++];
                    if (!(u & 128)) {
                        _ += String.fromCharCode(u);
                        continue
                    }
                    var c = r[t++] & 63;
                    if ((u & 224) == 192) {
                        _ += String.fromCharCode((u & 31) << 6 | c);
                        continue
                    }
                    var m = r[t++] & 63;
                    if ((u & 240) == 224 ? u = (u & 15) << 12 | c << 6 | m : u = (u & 7) << 18 | c << 12 | m << 6 | r[t++] & 63, u < 65536) _ += String.fromCharCode(u);
                    else {
                        var M = u - 65536;
                        _ += String.fromCharCode(55296 | M >> 10, 56320 | M & 1023)
                    }
                }
                return _
            },
            FS_stdin_getChar_buffer = [],
            lengthBytesUTF8 = r => {
                for (var t = 0, n = 0; n < r.length; ++n) {
                    var e = r.charCodeAt(n);
                    e <= 127 ? t++ : e <= 2047 ? t += 2 : e >= 55296 && e <= 57343 ? (t += 4, ++n) : t += 3
                }
                return t
            },
            stringToUTF8Array = (r, t, n, e) => {
                if (!(e > 0)) return 0;
                for (var a = n, _ = n + e - 1, u = 0; u < r.length; ++u) {
                    var c = r.charCodeAt(u);
                    if (c >= 55296 && c <= 57343) {
                        var m = r.charCodeAt(++u);
                        c = 65536 + ((c & 1023) << 10) | m & 1023
                    }
                    if (c <= 127) {
                        if (n >= _) break;
                        t[n++] = c
                    } else if (c <= 2047) {
                        if (n + 1 >= _) break;
                        t[n++] = 192 | c >> 6, t[n++] = 128 | c & 63
                    } else if (c <= 65535) {
                        if (n + 2 >= _) break;
                        t[n++] = 224 | c >> 12, t[n++] = 128 | c >> 6 & 63, t[n++] = 128 | c & 63
                    } else {
                        if (n + 3 >= _) break;
                        t[n++] = 240 | c >> 18, t[n++] = 128 | c >> 12 & 63, t[n++] = 128 | c >> 6 & 63, t[n++] = 128 | c & 63
                    }
                }
                return t[n] = 0, n - a
            };

        function intArrayFromString(r, t, n) {
            var e = lengthBytesUTF8(r) + 1,
                a = new Array(e),
                _ = stringToUTF8Array(r, a, 0, a.length);
            return a.length = _, a
        }
        var FS_stdin_getChar = () => {
                if (!FS_stdin_getChar_buffer.length) {
                    var r = null;
                    if (typeof window < "u" && typeof window.prompt == "function" ? (r = window.prompt("Input: "), r !== null && (r += `
`)) : typeof readline == "function" && (r = readline(), r !== null && (r += `
`)), !r) return null;
                    FS_stdin_getChar_buffer = intArrayFromString(r)
                }
                return FS_stdin_getChar_buffer.shift()
            },
            TTY = {
                ttys: [],
                init() {},
                shutdown() {},
                register(r, t) {
                    TTY.ttys[r] = {
                        input: [],
                        output: [],
                        ops: t
                    }, FS.registerDevice(r, TTY.stream_ops)
                },
                stream_ops: {
                    open(r) {
                        var t = TTY.ttys[r.node.rdev];
                        if (!t) throw new FS.ErrnoError(43);
                        r.tty = t, r.seekable = !1
                    },
                    close(r) {
                        r.tty.ops.fsync(r.tty)
                    },
                    fsync(r) {
                        r.tty.ops.fsync(r.tty)
                    },
                    read(r, t, n, e, a) {
                        if (!r.tty || !r.tty.ops.get_char) throw new FS.ErrnoError(60);
                        for (var _ = 0, u = 0; u < e; u++) {
                            var c;
                            try {
                                c = r.tty.ops.get_char(r.tty)
                            } catch {
                                throw new FS.ErrnoError(29)
                            }
                            if (c === void 0 && _ === 0) throw new FS.ErrnoError(6);
                            if (c == null) break;
                            _++, t[n + u] = c
                        }
                        return _ && (r.node.timestamp = Date.now()), _
                    },
                    write(r, t, n, e, a) {
                        if (!r.tty || !r.tty.ops.put_char) throw new FS.ErrnoError(60);
                        try {
                            for (var _ = 0; _ < e; _++) r.tty.ops.put_char(r.tty, t[n + _])
                        } catch {
                            throw new FS.ErrnoError(29)
                        }
                        return e && (r.node.timestamp = Date.now()), _
                    }
                },
                default_tty_ops: {
                    get_char(r) {
                        return FS_stdin_getChar()
                    },
                    put_char(r, t) {
                        t === null || t === 10 ? (out(UTF8ArrayToString(r.output, 0)), r.output = []) : t != 0 && r.output.push(t)
                    },
                    fsync(r) {
                        r.output && r.output.length > 0 && (out(UTF8ArrayToString(r.output, 0)), r.output = [])
                    },
                    ioctl_tcgets(r) {
                        return {
                            c_iflag: 25856,
                            c_oflag: 5,
                            c_cflag: 191,
                            c_lflag: 35387,
                            c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                        }
                    },
                    ioctl_tcsets(r, t, n) {
                        return 0
                    },
                    ioctl_tiocgwinsz(r) {
                        return [24, 80]
                    }
                },
                default_tty1_ops: {
                    put_char(r, t) {
                        t === null || t === 10 ? (err(UTF8ArrayToString(r.output, 0)), r.output = []) : t != 0 && r.output.push(t)
                    },
                    fsync(r) {
                        r.output && r.output.length > 0 && (err(UTF8ArrayToString(r.output, 0)), r.output = [])
                    }
                }
            },
            mmapAlloc = r => {
                abort()
            },
            MEMFS = {
                ops_table: null,
                mount(r) {
                    return MEMFS.createNode(null, "/", 16895, 0)
                },
                createNode(r, t, n, e) {
                    if (FS.isBlkdev(n) || FS.isFIFO(n)) throw new FS.ErrnoError(63);
                    MEMFS.ops_table || (MEMFS.ops_table = {
                        dir: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                lookup: MEMFS.node_ops.lookup,
                                mknod: MEMFS.node_ops.mknod,
                                rename: MEMFS.node_ops.rename,
                                unlink: MEMFS.node_ops.unlink,
                                rmdir: MEMFS.node_ops.rmdir,
                                readdir: MEMFS.node_ops.readdir,
                                symlink: MEMFS.node_ops.symlink
                            },
                            stream: {
                                llseek: MEMFS.stream_ops.llseek
                            }
                        },
                        file: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: {
                                llseek: MEMFS.stream_ops.llseek,
                                read: MEMFS.stream_ops.read,
                                write: MEMFS.stream_ops.write,
                                allocate: MEMFS.stream_ops.allocate,
                                mmap: MEMFS.stream_ops.mmap,
                                msync: MEMFS.stream_ops.msync
                            }
                        },
                        link: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr,
                                readlink: MEMFS.node_ops.readlink
                            },
                            stream: {}
                        },
                        chrdev: {
                            node: {
                                getattr: MEMFS.node_ops.getattr,
                                setattr: MEMFS.node_ops.setattr
                            },
                            stream: FS.chrdev_stream_ops
                        }
                    });
                    var a = FS.createNode(r, t, n, e);
                    return FS.isDir(a.mode) ? (a.node_ops = MEMFS.ops_table.dir.node, a.stream_ops = MEMFS.ops_table.dir.stream, a.contents = {}) : FS.isFile(a.mode) ? (a.node_ops = MEMFS.ops_table.file.node, a.stream_ops = MEMFS.ops_table.file.stream, a.usedBytes = 0, a.contents = null) : FS.isLink(a.mode) ? (a.node_ops = MEMFS.ops_table.link.node, a.stream_ops = MEMFS.ops_table.link.stream) : FS.isChrdev(a.mode) && (a.node_ops = MEMFS.ops_table.chrdev.node, a.stream_ops = MEMFS.ops_table.chrdev.stream), a.timestamp = Date.now(), r && (r.contents[t] = a, r.timestamp = a.timestamp), a
                },
                getFileDataAsTypedArray(r) {
                    return r.contents ? r.contents.subarray ? r.contents.subarray(0, r.usedBytes) : new Uint8Array(r.contents) : new Uint8Array(0)
                },
                expandFileStorage(r, t) {
                    var n = r.contents ? r.contents.length : 0;
                    if (!(n >= t)) {
                        var e = 1024 * 1024;
                        t = Math.max(t, n * (n < e ? 2 : 1.125) >>> 0), n != 0 && (t = Math.max(t, 256));
                        var a = r.contents;
                        r.contents = new Uint8Array(t), r.usedBytes > 0 && r.contents.set(a.subarray(0, r.usedBytes), 0)
                    }
                },
                resizeFileStorage(r, t) {
                    if (r.usedBytes != t)
                        if (t == 0) r.contents = null, r.usedBytes = 0;
                        else {
                            var n = r.contents;
                            r.contents = new Uint8Array(t), n && r.contents.set(n.subarray(0, Math.min(t, r.usedBytes))), r.usedBytes = t
                        }
                },
                node_ops: {
                    getattr(r) {
                        var t = {};
                        return t.dev = FS.isChrdev(r.mode) ? r.id : 1, t.ino = r.id, t.mode = r.mode, t.nlink = 1, t.uid = 0, t.gid = 0, t.rdev = r.rdev, FS.isDir(r.mode) ? t.size = 4096 : FS.isFile(r.mode) ? t.size = r.usedBytes : FS.isLink(r.mode) ? t.size = r.link.length : t.size = 0, t.atime = new Date(r.timestamp), t.mtime = new Date(r.timestamp), t.ctime = new Date(r.timestamp), t.blksize = 4096, t.blocks = Math.ceil(t.size / t.blksize), t
                    },
                    setattr(r, t) {
                        t.mode !== void 0 && (r.mode = t.mode), t.timestamp !== void 0 && (r.timestamp = t.timestamp), t.size !== void 0 && MEMFS.resizeFileStorage(r, t.size)
                    },
                    lookup(r, t) {
                        throw FS.genericErrors[44]
                    },
                    mknod(r, t, n, e) {
                        return MEMFS.createNode(r, t, n, e)
                    },
                    rename(r, t, n) {
                        if (FS.isDir(r.mode)) {
                            var e;
                            try {
                                e = FS.lookupNode(t, n)
                            } catch {}
                            if (e)
                                for (var a in e.contents) throw new FS.ErrnoError(55)
                        }
                        delete r.parent.contents[r.name], r.parent.timestamp = Date.now(), r.name = n, t.contents[n] = r, t.timestamp = r.parent.timestamp, r.parent = t
                    },
                    unlink(r, t) {
                        delete r.contents[t], r.timestamp = Date.now()
                    },
                    rmdir(r, t) {
                        var n = FS.lookupNode(r, t);
                        for (var e in n.contents) throw new FS.ErrnoError(55);
                        delete r.contents[t], r.timestamp = Date.now()
                    },
                    readdir(r) {
                        var t = [".", ".."];
                        for (var n of Object.keys(r.contents)) t.push(n);
                        return t
                    },
                    symlink(r, t, n) {
                        var e = MEMFS.createNode(r, t, 41471, 0);
                        return e.link = n, e
                    },
                    readlink(r) {
                        if (!FS.isLink(r.mode)) throw new FS.ErrnoError(28);
                        return r.link
                    }
                },
                stream_ops: {
                    read(r, t, n, e, a) {
                        var _ = r.node.contents;
                        if (a >= r.node.usedBytes) return 0;
                        var u = Math.min(r.node.usedBytes - a, e);
                        if (u > 8 && _.subarray) t.set(_.subarray(a, a + u), n);
                        else
                            for (var c = 0; c < u; c++) t[n + c] = _[a + c];
                        return u
                    },
                    write(r, t, n, e, a, _) {
                        if (t.buffer === HEAP8.buffer && (_ = !1), !e) return 0;
                        var u = r.node;
                        if (u.timestamp = Date.now(), t.subarray && (!u.contents || u.contents.subarray)) {
                            if (_) return u.contents = t.subarray(n, n + e), u.usedBytes = e, e;
                            if (u.usedBytes === 0 && a === 0) return u.contents = t.slice(n, n + e), u.usedBytes = e, e;
                            if (a + e <= u.usedBytes) return u.contents.set(t.subarray(n, n + e), a), e
                        }
                        if (MEMFS.expandFileStorage(u, a + e), u.contents.subarray && t.subarray) u.contents.set(t.subarray(n, n + e), a);
                        else
                            for (var c = 0; c < e; c++) u.contents[a + c] = t[n + c];
                        return u.usedBytes = Math.max(u.usedBytes, a + e), e
                    },
                    llseek(r, t, n) {
                        var e = t;
                        if (n === 1 ? e += r.position : n === 2 && FS.isFile(r.node.mode) && (e += r.node.usedBytes), e < 0) throw new FS.ErrnoError(28);
                        return e
                    },
                    allocate(r, t, n) {
                        MEMFS.expandFileStorage(r.node, t + n), r.node.usedBytes = Math.max(r.node.usedBytes, t + n)
                    },
                    mmap(r, t, n, e, a) {
                        if (!FS.isFile(r.node.mode)) throw new FS.ErrnoError(43);
                        var _, u, c = r.node.contents;
                        if (!(a & 2) && c.buffer === HEAP8.buffer) u = !1, _ = c.byteOffset;
                        else {
                            if ((n > 0 || n + t < c.length) && (c.subarray ? c = c.subarray(n, n + t) : c = Array.prototype.slice.call(c, n, n + t)), u = !0, _ = mmapAlloc(), !_) throw new FS.ErrnoError(48);
                            HEAP8.set(c, _)
                        }
                        return {
                            ptr: _,
                            allocated: u
                        }
                    },
                    msync(r, t, n, e, a) {
                        return MEMFS.stream_ops.write(r, t, 0, e, n, !1), 0
                    }
                }
            },
            asyncLoad = (r, t, n, e) => {
                var a = `al ${r}`;
                readAsync(r, _ => {
                    t(new Uint8Array(_)), a && removeRunDependency()
                }, _ => {
                    if (n) n();
                    else throw `Loading data file "${r}" failed.`
                }), a && addRunDependency()
            },
            FS_createDataFile = (r, t, n, e, a, _) => {
                FS.createDataFile(r, t, n, e, a, _)
            },
            preloadPlugins = Module.preloadPlugins || [],
            FS_handledByPreloadPlugin = (r, t, n, e) => {
                typeof Browser < "u" && Browser.init();
                var a = !1;
                return preloadPlugins.forEach(_ => {
                    a || _.canHandle(t) && (_.handle(r, t, n, e), a = !0)
                }), a
            },
            FS_createPreloadedFile = (r, t, n, e, a, _, u, c, m, M) => {
                var S = t ? PATH_FS.resolve(PATH.join2(r, t)) : r;

                function L(R) {
                    function C(I) {
                        M == null || M(), c || FS_createDataFile(r, t, I, e, a, m), _ == null || _(), removeRunDependency()
                    }
                    FS_handledByPreloadPlugin(R, S, C, () => {
                        u == null || u(), removeRunDependency()
                    }) || C(R)
                }
                addRunDependency(), typeof n == "string" ? asyncLoad(n, L, u) : L(n)
            },
            FS_modeStringToFlags = r => {
                var t = {
                        r: 0,
                        "r+": 2,
                        w: 577,
                        "w+": 578,
                        a: 1089,
                        "a+": 1090
                    },
                    n = t[r];
                if (typeof n > "u") throw new Error(`Unknown file open mode: ${r}`);
                return n
            },
            FS_getMode = (r, t) => {
                var n = 0;
                return r && (n |= 365), t && (n |= 146), n
            },
            FS = {
                root: null,
                mounts: [],
                devices: {},
                streams: [],
                nextInode: 1,
                nameTable: null,
                currentPath: "/",
                initialized: !1,
                ignorePermissions: !0,
                ErrnoError: class {
                    constructor(r) {
                        this.name = "ErrnoError", this.errno = r
                    }
                },
                genericErrors: {},
                filesystems: null,
                syncFSRequests: 0,
                FSStream: class {
                    constructor() {
                        this.shared = {}
                    }
                    get object() {
                        return this.node
                    }
                    set object(r) {
                        this.node = r
                    }
                    get isRead() {
                        return (this.flags & 2097155) !== 1
                    }
                    get isWrite() {
                        return (this.flags & 2097155) !== 0
                    }
                    get isAppend() {
                        return this.flags & 1024
                    }
                    get flags() {
                        return this.shared.flags
                    }
                    set flags(r) {
                        this.shared.flags = r
                    }
                    get position() {
                        return this.shared.position
                    }
                    set position(r) {
                        this.shared.position = r
                    }
                },
                FSNode: class {
                    constructor(r, t, n, e) {
                        r || (r = this), this.parent = r, this.mount = r.mount, this.mounted = null, this.id = FS.nextInode++, this.name = t, this.mode = n, this.node_ops = {}, this.stream_ops = {}, this.rdev = e, this.readMode = 365, this.writeMode = 146
                    }
                    get read() {
                        return (this.mode & this.readMode) === this.readMode
                    }
                    set read(r) {
                        r ? this.mode |= this.readMode : this.mode &= ~this.readMode
                    }
                    get write() {
                        return (this.mode & this.writeMode) === this.writeMode
                    }
                    set write(r) {
                        r ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
                    }
                    get isFolder() {
                        return FS.isDir(this.mode)
                    }
                    get isDevice() {
                        return FS.isChrdev(this.mode)
                    }
                },
                lookupPath(r, t = {}) {
                    if (r = PATH_FS.resolve(r), !r) return {
                        path: "",
                        node: null
                    };
                    var n = {
                        follow_mount: !0,
                        recurse_count: 0
                    };
                    if (t = Object.assign(n, t), t.recurse_count > 8) throw new FS.ErrnoError(32);
                    for (var e = r.split("/").filter(L => !!L), a = FS.root, _ = "/", u = 0; u < e.length; u++) {
                        var c = u === e.length - 1;
                        if (c && t.parent) break;
                        if (a = FS.lookupNode(a, e[u]), _ = PATH.join2(_, e[u]), FS.isMountpoint(a) && (!c || c && t.follow_mount) && (a = a.mounted.root), !c || t.follow)
                            for (var m = 0; FS.isLink(a.mode);) {
                                var M = FS.readlink(_);
                                _ = PATH_FS.resolve(PATH.dirname(_), M);
                                var S = FS.lookupPath(_, {
                                    recurse_count: t.recurse_count + 1
                                });
                                if (a = S.node, m++ > 40) throw new FS.ErrnoError(32)
                            }
                    }
                    return {
                        path: _,
                        node: a
                    }
                },
                getPath(r) {
                    for (var t;;) {
                        if (FS.isRoot(r)) {
                            var n = r.mount.mountpoint;
                            return t ? n[n.length - 1] !== "/" ? `${n}/${t}` : n + t : n
                        }
                        t = t ? `${r.name}/${t}` : r.name, r = r.parent
                    }
                },
                hashName(r, t) {
                    for (var n = 0, e = 0; e < t.length; e++) n = (n << 5) - n + t.charCodeAt(e) | 0;
                    return (r + n >>> 0) % FS.nameTable.length
                },
                hashAddNode(r) {
                    var t = FS.hashName(r.parent.id, r.name);
                    r.name_next = FS.nameTable[t], FS.nameTable[t] = r
                },
                hashRemoveNode(r) {
                    var t = FS.hashName(r.parent.id, r.name);
                    if (FS.nameTable[t] === r) FS.nameTable[t] = r.name_next;
                    else
                        for (var n = FS.nameTable[t]; n;) {
                            if (n.name_next === r) {
                                n.name_next = r.name_next;
                                break
                            }
                            n = n.name_next
                        }
                },
                lookupNode(r, t) {
                    var n = FS.mayLookup(r);
                    if (n) throw new FS.ErrnoError(n);
                    for (var e = FS.hashName(r.id, t), a = FS.nameTable[e]; a; a = a.name_next) {
                        var _ = a.name;
                        if (a.parent.id === r.id && _ === t) return a
                    }
                    return FS.lookup(r, t)
                },
                createNode(r, t, n, e) {
                    var a = new FS.FSNode(r, t, n, e);
                    return FS.hashAddNode(a), a
                },
                destroyNode(r) {
                    FS.hashRemoveNode(r)
                },
                isRoot(r) {
                    return r === r.parent
                },
                isMountpoint(r) {
                    return !!r.mounted
                },
                isFile(r) {
                    return (r & 61440) === 32768
                },
                isDir(r) {
                    return (r & 61440) === 16384
                },
                isLink(r) {
                    return (r & 61440) === 40960
                },
                isChrdev(r) {
                    return (r & 61440) === 8192
                },
                isBlkdev(r) {
                    return (r & 61440) === 24576
                },
                isFIFO(r) {
                    return (r & 61440) === 4096
                },
                isSocket(r) {
                    return (r & 49152) === 49152
                },
                flagsToPermissionString(r) {
                    var t = ["r", "w", "rw"][r & 3];
                    return r & 512 && (t += "w"), t
                },
                nodePermissions(r, t) {
                    return FS.ignorePermissions ? 0 : t.includes("r") && !(r.mode & 292) || t.includes("w") && !(r.mode & 146) || t.includes("x") && !(r.mode & 73) ? 2 : 0
                },
                mayLookup(r) {
                    if (!FS.isDir(r.mode)) return 54;
                    var t = FS.nodePermissions(r, "x");
                    return t || (r.node_ops.lookup ? 0 : 2)
                },
                mayCreate(r, t) {
                    try {
                        var n = FS.lookupNode(r, t);
                        return 20
                    } catch {}
                    return FS.nodePermissions(r, "wx")
                },
                mayDelete(r, t, n) {
                    var e;
                    try {
                        e = FS.lookupNode(r, t)
                    } catch (_) {
                        return _.errno
                    }
                    var a = FS.nodePermissions(r, "wx");
                    if (a) return a;
                    if (n) {
                        if (!FS.isDir(e.mode)) return 54;
                        if (FS.isRoot(e) || FS.getPath(e) === FS.cwd()) return 10
                    } else if (FS.isDir(e.mode)) return 31;
                    return 0
                },
                mayOpen(r, t) {
                    return r ? FS.isLink(r.mode) ? 32 : FS.isDir(r.mode) && (FS.flagsToPermissionString(t) !== "r" || t & 512) ? 31 : FS.nodePermissions(r, FS.flagsToPermissionString(t)) : 44
                },
                MAX_OPEN_FDS: 4096,
                nextfd() {
                    for (var r = 0; r <= FS.MAX_OPEN_FDS; r++)
                        if (!FS.streams[r]) return r;
                    throw new FS.ErrnoError(33)
                },
                getStreamChecked(r) {
                    var t = FS.getStream(r);
                    if (!t) throw new FS.ErrnoError(8);
                    return t
                },
                getStream: r => FS.streams[r],
                createStream(r, t = -1) {
                    return r = Object.assign(new FS.FSStream, r), t == -1 && (t = FS.nextfd()), r.fd = t, FS.streams[t] = r, r
                },
                closeStream(r) {
                    FS.streams[r] = null
                },
                dupStream(r, t = -1) {
                    var e, a;
                    var n = FS.createStream(r, t);
                    return (a = (e = n.stream_ops) == null ? void 0 : e.dup) == null || a.call(e, n), n
                },
                chrdev_stream_ops: {
                    open(r) {
                        var n, e;
                        var t = FS.getDevice(r.node.rdev);
                        r.stream_ops = t.stream_ops, (e = (n = r.stream_ops).open) == null || e.call(n, r)
                    },
                    llseek() {
                        throw new FS.ErrnoError(70)
                    }
                },
                major: r => r >> 8,
                minor: r => r & 255,
                makedev: (r, t) => r << 8 | t,
                registerDevice(r, t) {
                    FS.devices[r] = {
                        stream_ops: t
                    }
                },
                getDevice: r => FS.devices[r],
                getMounts(r) {
                    for (var t = [], n = [r]; n.length;) {
                        var e = n.pop();
                        t.push(e), n.push(...e.mounts)
                    }
                    return t
                },
                syncfs(r, t) {
                    typeof r == "function" && (t = r, r = !1), FS.syncFSRequests++, FS.syncFSRequests > 1 && err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
                    var n = FS.getMounts(FS.root.mount),
                        e = 0;

                    function a(u) {
                        return FS.syncFSRequests--, t(u)
                    }

                    function _(u) {
                        if (u) return _.errored ? void 0 : (_.errored = !0, a(u));
                        ++e >= n.length && a(null)
                    }
                    n.forEach(u => {
                        if (!u.type.syncfs) return _(null);
                        u.type.syncfs(u, r, _)
                    })
                },
                mount(r, t, n) {
                    var e = n === "/",
                        a = !n,
                        _;
                    if (e && FS.root) throw new FS.ErrnoError(10);
                    if (!e && !a) {
                        var u = FS.lookupPath(n, {
                            follow_mount: !1
                        });
                        if (n = u.path, _ = u.node, FS.isMountpoint(_)) throw new FS.ErrnoError(10);
                        if (!FS.isDir(_.mode)) throw new FS.ErrnoError(54)
                    }
                    var c = {
                            type: r,
                            opts: t,
                            mountpoint: n,
                            mounts: []
                        },
                        m = r.mount(c);
                    return m.mount = c, c.root = m, e ? FS.root = m : _ && (_.mounted = c, _.mount && _.mount.mounts.push(c)), m
                },
                unmount(r) {
                    var t = FS.lookupPath(r, {
                        follow_mount: !1
                    });
                    if (!FS.isMountpoint(t.node)) throw new FS.ErrnoError(28);
                    var n = t.node,
                        e = n.mounted,
                        a = FS.getMounts(e);
                    Object.keys(FS.nameTable).forEach(u => {
                        for (var c = FS.nameTable[u]; c;) {
                            var m = c.name_next;
                            a.includes(c.mount) && FS.destroyNode(c), c = m
                        }
                    }), n.mounted = null;
                    var _ = n.mount.mounts.indexOf(e);
                    n.mount.mounts.splice(_, 1)
                },
                lookup(r, t) {
                    return r.node_ops.lookup(r, t)
                },
                mknod(r, t, n) {
                    var e = FS.lookupPath(r, {
                            parent: !0
                        }),
                        a = e.node,
                        _ = PATH.basename(r);
                    if (!_ || _ === "." || _ === "..") throw new FS.ErrnoError(28);
                    var u = FS.mayCreate(a, _);
                    if (u) throw new FS.ErrnoError(u);
                    if (!a.node_ops.mknod) throw new FS.ErrnoError(63);
                    return a.node_ops.mknod(a, _, t, n)
                },
                create(r, t) {
                    return t = t !== void 0 ? t : 438, t &= 4095, t |= 32768, FS.mknod(r, t, 0)
                },
                mkdir(r, t) {
                    return t = t !== void 0 ? t : 511, t &= 1023, t |= 16384, FS.mknod(r, t, 0)
                },
                mkdirTree(r, t) {
                    for (var n = r.split("/"), e = "", a = 0; a < n.length; ++a)
                        if (n[a]) {
                            e += "/" + n[a];
                            try {
                                FS.mkdir(e, t)
                            } catch (_) {
                                if (_.errno != 20) throw _
                            }
                        }
                },
                mkdev(r, t, n) {
                    return typeof n > "u" && (n = t, t = 438), t |= 8192, FS.mknod(r, t, n)
                },
                symlink(r, t) {
                    if (!PATH_FS.resolve(r)) throw new FS.ErrnoError(44);
                    var n = FS.lookupPath(t, {
                            parent: !0
                        }),
                        e = n.node;
                    if (!e) throw new FS.ErrnoError(44);
                    var a = PATH.basename(t),
                        _ = FS.mayCreate(e, a);
                    if (_) throw new FS.ErrnoError(_);
                    if (!e.node_ops.symlink) throw new FS.ErrnoError(63);
                    return e.node_ops.symlink(e, a, r)
                },
                rename(r, t) {
                    var n = PATH.dirname(r),
                        e = PATH.dirname(t),
                        a = PATH.basename(r),
                        _ = PATH.basename(t),
                        u, c, m;
                    if (u = FS.lookupPath(r, {
                            parent: !0
                        }), c = u.node, u = FS.lookupPath(t, {
                            parent: !0
                        }), m = u.node, !c || !m) throw new FS.ErrnoError(44);
                    if (c.mount !== m.mount) throw new FS.ErrnoError(75);
                    var M = FS.lookupNode(c, a),
                        S = PATH_FS.relative(r, e);
                    if (S.charAt(0) !== ".") throw new FS.ErrnoError(28);
                    if (S = PATH_FS.relative(t, n), S.charAt(0) !== ".") throw new FS.ErrnoError(55);
                    var L;
                    try {
                        L = FS.lookupNode(m, _)
                    } catch {}
                    if (M !== L) {
                        var R = FS.isDir(M.mode),
                            C = FS.mayDelete(c, a, R);
                        if (C) throw new FS.ErrnoError(C);
                        if (C = L ? FS.mayDelete(m, _, R) : FS.mayCreate(m, _), C) throw new FS.ErrnoError(C);
                        if (!c.node_ops.rename) throw new FS.ErrnoError(63);
                        if (FS.isMountpoint(M) || L && FS.isMountpoint(L)) throw new FS.ErrnoError(10);
                        if (m !== c && (C = FS.nodePermissions(c, "w"), C)) throw new FS.ErrnoError(C);
                        FS.hashRemoveNode(M);
                        try {
                            c.node_ops.rename(M, m, _)
                        } catch (I) {
                            throw I
                        } finally {
                            FS.hashAddNode(M)
                        }
                    }
                },
                rmdir(r) {
                    var t = FS.lookupPath(r, {
                            parent: !0
                        }),
                        n = t.node,
                        e = PATH.basename(r),
                        a = FS.lookupNode(n, e),
                        _ = FS.mayDelete(n, e, !0);
                    if (_) throw new FS.ErrnoError(_);
                    if (!n.node_ops.rmdir) throw new FS.ErrnoError(63);
                    if (FS.isMountpoint(a)) throw new FS.ErrnoError(10);
                    n.node_ops.rmdir(n, e), FS.destroyNode(a)
                },
                readdir(r) {
                    var t = FS.lookupPath(r, {
                            follow: !0
                        }),
                        n = t.node;
                    if (!n.node_ops.readdir) throw new FS.ErrnoError(54);
                    return n.node_ops.readdir(n)
                },
                unlink(r) {
                    var t = FS.lookupPath(r, {
                            parent: !0
                        }),
                        n = t.node;
                    if (!n) throw new FS.ErrnoError(44);
                    var e = PATH.basename(r),
                        a = FS.lookupNode(n, e),
                        _ = FS.mayDelete(n, e, !1);
                    if (_) throw new FS.ErrnoError(_);
                    if (!n.node_ops.unlink) throw new FS.ErrnoError(63);
                    if (FS.isMountpoint(a)) throw new FS.ErrnoError(10);
                    n.node_ops.unlink(n, e), FS.destroyNode(a)
                },
                readlink(r) {
                    var t = FS.lookupPath(r),
                        n = t.node;
                    if (!n) throw new FS.ErrnoError(44);
                    if (!n.node_ops.readlink) throw new FS.ErrnoError(28);
                    return PATH_FS.resolve(FS.getPath(n.parent), n.node_ops.readlink(n))
                },
                stat(r, t) {
                    var n = FS.lookupPath(r, {
                            follow: !t
                        }),
                        e = n.node;
                    if (!e) throw new FS.ErrnoError(44);
                    if (!e.node_ops.getattr) throw new FS.ErrnoError(63);
                    return e.node_ops.getattr(e)
                },
                lstat(r) {
                    return FS.stat(r, !0)
                },
                chmod(r, t, n) {
                    var e;
                    if (typeof r == "string") {
                        var a = FS.lookupPath(r, {
                            follow: !n
                        });
                        e = a.node
                    } else e = r;
                    if (!e.node_ops.setattr) throw new FS.ErrnoError(63);
                    e.node_ops.setattr(e, {
                        mode: t & 4095 | e.mode & -4096,
                        timestamp: Date.now()
                    })
                },
                lchmod(r, t) {
                    FS.chmod(r, t, !0)
                },
                fchmod(r, t) {
                    var n = FS.getStreamChecked(r);
                    FS.chmod(n.node, t)
                },
                chown(r, t, n, e) {
                    var a;
                    if (typeof r == "string") {
                        var _ = FS.lookupPath(r, {
                            follow: !e
                        });
                        a = _.node
                    } else a = r;
                    if (!a.node_ops.setattr) throw new FS.ErrnoError(63);
                    a.node_ops.setattr(a, {
                        timestamp: Date.now()
                    })
                },
                lchown(r, t, n) {
                    FS.chown(r, t, n, !0)
                },
                fchown(r, t, n) {
                    var e = FS.getStreamChecked(r);
                    FS.chown(e.node, t, n)
                },
                truncate(r, t) {
                    if (t < 0) throw new FS.ErrnoError(28);
                    var n;
                    if (typeof r == "string") {
                        var e = FS.lookupPath(r, {
                            follow: !0
                        });
                        n = e.node
                    } else n = r;
                    if (!n.node_ops.setattr) throw new FS.ErrnoError(63);
                    if (FS.isDir(n.mode)) throw new FS.ErrnoError(31);
                    if (!FS.isFile(n.mode)) throw new FS.ErrnoError(28);
                    var a = FS.nodePermissions(n, "w");
                    if (a) throw new FS.ErrnoError(a);
                    n.node_ops.setattr(n, {
                        size: t,
                        timestamp: Date.now()
                    })
                },
                ftruncate(r, t) {
                    var n = FS.getStreamChecked(r);
                    if (!(n.flags & 2097155)) throw new FS.ErrnoError(28);
                    FS.truncate(n.node, t)
                },
                utime(r, t, n) {
                    var e = FS.lookupPath(r, {
                            follow: !0
                        }),
                        a = e.node;
                    a.node_ops.setattr(a, {
                        timestamp: Math.max(t, n)
                    })
                },
                open(r, t, n) {
                    if (r === "") throw new FS.ErrnoError(44);
                    t = typeof t == "string" ? FS_modeStringToFlags(t) : t, n = typeof n > "u" ? 438 : n, t & 64 ? n = n & 4095 | 32768 : n = 0;
                    var e;
                    if (typeof r == "object") e = r;
                    else {
                        r = PATH.normalize(r);
                        try {
                            var a = FS.lookupPath(r, {
                                follow: !(t & 131072)
                            });
                            e = a.node
                        } catch {}
                    }
                    var _ = !1;
                    if (t & 64)
                        if (e) {
                            if (t & 128) throw new FS.ErrnoError(20)
                        } else e = FS.mknod(r, n, 0), _ = !0;
                    if (!e) throw new FS.ErrnoError(44);
                    if (FS.isChrdev(e.mode) && (t &= -513), t & 65536 && !FS.isDir(e.mode)) throw new FS.ErrnoError(54);
                    if (!_) {
                        var u = FS.mayOpen(e, t);
                        if (u) throw new FS.ErrnoError(u)
                    }
                    t & 512 && !_ && FS.truncate(e, 0), t &= -131713;
                    var c = FS.createStream({
                        node: e,
                        path: FS.getPath(e),
                        flags: t,
                        seekable: !0,
                        position: 0,
                        stream_ops: e.stream_ops,
                        ungotten: [],
                        error: !1
                    });
                    return c.stream_ops.open && c.stream_ops.open(c), Module.logReadFiles && !(t & 1) && (FS.readFiles || (FS.readFiles = {}), r in FS.readFiles || (FS.readFiles[r] = 1)), c
                },
                close(r) {
                    if (FS.isClosed(r)) throw new FS.ErrnoError(8);
                    r.getdents && (r.getdents = null);
                    try {
                        r.stream_ops.close && r.stream_ops.close(r)
                    } catch (t) {
                        throw t
                    } finally {
                        FS.closeStream(r.fd)
                    }
                    r.fd = null
                },
                isClosed(r) {
                    return r.fd === null
                },
                llseek(r, t, n) {
                    if (FS.isClosed(r)) throw new FS.ErrnoError(8);
                    if (!r.seekable || !r.stream_ops.llseek) throw new FS.ErrnoError(70);
                    if (n != 0 && n != 1 && n != 2) throw new FS.ErrnoError(28);
                    return r.position = r.stream_ops.llseek(r, t, n), r.ungotten = [], r.position
                },
                read(r, t, n, e, a) {
                    if (e < 0 || a < 0) throw new FS.ErrnoError(28);
                    if (FS.isClosed(r)) throw new FS.ErrnoError(8);
                    if ((r.flags & 2097155) === 1) throw new FS.ErrnoError(8);
                    if (FS.isDir(r.node.mode)) throw new FS.ErrnoError(31);
                    if (!r.stream_ops.read) throw new FS.ErrnoError(28);
                    var _ = typeof a < "u";
                    if (!_) a = r.position;
                    else if (!r.seekable) throw new FS.ErrnoError(70);
                    var u = r.stream_ops.read(r, t, n, e, a);
                    return _ || (r.position += u), u
                },
                write(r, t, n, e, a, _) {
                    if (e < 0 || a < 0) throw new FS.ErrnoError(28);
                    if (FS.isClosed(r)) throw new FS.ErrnoError(8);
                    if (!(r.flags & 2097155)) throw new FS.ErrnoError(8);
                    if (FS.isDir(r.node.mode)) throw new FS.ErrnoError(31);
                    if (!r.stream_ops.write) throw new FS.ErrnoError(28);
                    r.seekable && r.flags & 1024 && FS.llseek(r, 0, 2);
                    var u = typeof a < "u";
                    if (!u) a = r.position;
                    else if (!r.seekable) throw new FS.ErrnoError(70);
                    var c = r.stream_ops.write(r, t, n, e, a, _);
                    return u || (r.position += c), c
                },
                allocate(r, t, n) {
                    if (FS.isClosed(r)) throw new FS.ErrnoError(8);
                    if (t < 0 || n <= 0) throw new FS.ErrnoError(28);
                    if (!(r.flags & 2097155)) throw new FS.ErrnoError(8);
                    if (!FS.isFile(r.node.mode) && !FS.isDir(r.node.mode)) throw new FS.ErrnoError(43);
                    if (!r.stream_ops.allocate) throw new FS.ErrnoError(138);
                    r.stream_ops.allocate(r, t, n)
                },
                mmap(r, t, n, e, a) {
                    if (e & 2 && !(a & 2) && (r.flags & 2097155) !== 2) throw new FS.ErrnoError(2);
                    if ((r.flags & 2097155) === 1) throw new FS.ErrnoError(2);
                    if (!r.stream_ops.mmap) throw new FS.ErrnoError(43);
                    return r.stream_ops.mmap(r, t, n, e, a)
                },
                msync(r, t, n, e, a) {
                    return r.stream_ops.msync ? r.stream_ops.msync(r, t, n, e, a) : 0
                },
                ioctl(r, t, n) {
                    if (!r.stream_ops.ioctl) throw new FS.ErrnoError(59);
                    return r.stream_ops.ioctl(r, t, n)
                },
                readFile(r, t = {}) {
                    if (t.flags = t.flags || 0, t.encoding = t.encoding || "binary", t.encoding !== "utf8" && t.encoding !== "binary") throw new Error(`Invalid encoding type "${t.encoding}"`);
                    var n, e = FS.open(r, t.flags),
                        a = FS.stat(r),
                        _ = a.size,
                        u = new Uint8Array(_);
                    return FS.read(e, u, 0, _, 0), t.encoding === "utf8" ? n = UTF8ArrayToString(u, 0) : t.encoding === "binary" && (n = u), FS.close(e), n
                },
                writeFile(r, t, n = {}) {
                    n.flags = n.flags || 577;
                    var e = FS.open(r, n.flags, n.mode);
                    if (typeof t == "string") {
                        var a = new Uint8Array(lengthBytesUTF8(t) + 1),
                            _ = stringToUTF8Array(t, a, 0, a.length);
                        FS.write(e, a, 0, _, void 0, n.canOwn)
                    } else if (ArrayBuffer.isView(t)) FS.write(e, t, 0, t.byteLength, void 0, n.canOwn);
                    else throw new Error("Unsupported data type");
                    FS.close(e)
                },
                cwd: () => FS.currentPath,
                chdir(r) {
                    var t = FS.lookupPath(r, {
                        follow: !0
                    });
                    if (t.node === null) throw new FS.ErrnoError(44);
                    if (!FS.isDir(t.node.mode)) throw new FS.ErrnoError(54);
                    var n = FS.nodePermissions(t.node, "x");
                    if (n) throw new FS.ErrnoError(n);
                    FS.currentPath = t.path
                },
                createDefaultDirectories() {
                    FS.mkdir("/tmp"), FS.mkdir("/home"), FS.mkdir("/home/web_user")
                },
                createDefaultDevices() {
                    FS.mkdir("/dev"), FS.registerDevice(FS.makedev(1, 3), {
                        read: () => 0,
                        write: (e, a, _, u, c) => u
                    }), FS.mkdev("/dev/null", FS.makedev(1, 3)), TTY.register(FS.makedev(5, 0), TTY.default_tty_ops), TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops), FS.mkdev("/dev/tty", FS.makedev(5, 0)), FS.mkdev("/dev/tty1", FS.makedev(6, 0));
                    var r = new Uint8Array(1024),
                        t = 0,
                        n = () => (t === 0 && (t = randomFill(r).byteLength), r[--t]);
                    FS.createDevice("/dev", "random", n), FS.createDevice("/dev", "urandom", n), FS.mkdir("/dev/shm"), FS.mkdir("/dev/shm/tmp")
                },
                createSpecialDirectories() {
                    FS.mkdir("/proc");
                    var r = FS.mkdir("/proc/self");
                    FS.mkdir("/proc/self/fd"), FS.mount({
                        mount() {
                            var t = FS.createNode(r, "fd", 16895, 73);
                            return t.node_ops = {
                                lookup(n, e) {
                                    var a = +e,
                                        _ = FS.getStreamChecked(a),
                                        u = {
                                            parent: null,
                                            mount: {
                                                mountpoint: "fake"
                                            },
                                            node_ops: {
                                                readlink: () => _.path
                                            }
                                        };
                                    return u.parent = u, u
                                }
                            }, t
                        }
                    }, {}, "/proc/self/fd")
                },
                createStandardStreams() {
                    Module.stdin ? FS.createDevice("/dev", "stdin", Module.stdin) : FS.symlink("/dev/tty", "/dev/stdin"), Module.stdout ? FS.createDevice("/dev", "stdout", null, Module.stdout) : FS.symlink("/dev/tty", "/dev/stdout"), Module.stderr ? FS.createDevice("/dev", "stderr", null, Module.stderr) : FS.symlink("/dev/tty1", "/dev/stderr"), FS.open("/dev/stdin", 0), FS.open("/dev/stdout", 1), FS.open("/dev/stderr", 1)
                },
                staticInit() {
                    [44].forEach(r => {
                        FS.genericErrors[r] = new FS.ErrnoError(r), FS.genericErrors[r].stack = "<generic error, no stack>"
                    }), FS.nameTable = new Array(4096), FS.mount(MEMFS, {}, "/"), FS.createDefaultDirectories(), FS.createDefaultDevices(), FS.createSpecialDirectories(), FS.filesystems = {
                        MEMFS
                    }
                },
                init(r, t, n) {
                    FS.init.initialized = !0, Module.stdin = r || Module.stdin, Module.stdout = t || Module.stdout, Module.stderr = n || Module.stderr, FS.createStandardStreams()
                },
                quit() {
                    FS.init.initialized = !1;
                    for (var r = 0; r < FS.streams.length; r++) {
                        var t = FS.streams[r];
                        t && FS.close(t)
                    }
                },
                findObject(r, t) {
                    var n = FS.analyzePath(r, t);
                    return n.exists ? n.object : null
                },
                analyzePath(r, t) {
                    try {
                        var n = FS.lookupPath(r, {
                            follow: !t
                        });
                        r = n.path
                    } catch {}
                    var e = {
                        isRoot: !1,
                        exists: !1,
                        error: 0,
                        name: null,
                        path: null,
                        object: null,
                        parentExists: !1,
                        parentPath: null,
                        parentObject: null
                    };
                    try {
                        var n = FS.lookupPath(r, {
                            parent: !0
                        });
                        e.parentExists = !0, e.parentPath = n.path, e.parentObject = n.node, e.name = PATH.basename(r), n = FS.lookupPath(r, {
                            follow: !t
                        }), e.exists = !0, e.path = n.path, e.object = n.node, e.name = n.node.name, e.isRoot = n.path === "/"
                    } catch (a) {
                        e.error = a.errno
                    }
                    return e
                },
                createPath(r, t, n, e) {
                    r = typeof r == "string" ? r : FS.getPath(r);
                    for (var a = t.split("/").reverse(); a.length;) {
                        var _ = a.pop();
                        if (_) {
                            var u = PATH.join2(r, _);
                            try {
                                FS.mkdir(u)
                            } catch {}
                            r = u
                        }
                    }
                    return u
                },
                createFile(r, t, n, e, a) {
                    var _ = PATH.join2(typeof r == "string" ? r : FS.getPath(r), t),
                        u = FS_getMode(e, a);
                    return FS.create(_, u)
                },
                createDataFile(r, t, n, e, a, _) {
                    var u = t;
                    r && (r = typeof r == "string" ? r : FS.getPath(r), u = t ? PATH.join2(r, t) : r);
                    var c = FS_getMode(e, a),
                        m = FS.create(u, c);
                    if (n) {
                        if (typeof n == "string") {
                            for (var M = new Array(n.length), S = 0, L = n.length; S < L; ++S) M[S] = n.charCodeAt(S);
                            n = M
                        }
                        FS.chmod(m, c | 146);
                        var R = FS.open(m, 577);
                        FS.write(R, n, 0, n.length, 0, _), FS.close(R), FS.chmod(m, c)
                    }
                },
                createDevice(r, t, n, e) {
                    var a = PATH.join2(typeof r == "string" ? r : FS.getPath(r), t),
                        _ = FS_getMode(!!n, !!e);
                    FS.createDevice.major || (FS.createDevice.major = 64);
                    var u = FS.makedev(FS.createDevice.major++, 0);
                    return FS.registerDevice(u, {
                        open(c) {
                            c.seekable = !1
                        },
                        close(c) {
                            var m;
                            (m = e == null ? void 0 : e.buffer) != null && m.length && e(10)
                        },
                        read(c, m, M, S, L) {
                            for (var R = 0, C = 0; C < S; C++) {
                                var I;
                                try {
                                    I = n()
                                } catch {
                                    throw new FS.ErrnoError(29)
                                }
                                if (I === void 0 && R === 0) throw new FS.ErrnoError(6);
                                if (I == null) break;
                                R++, m[M + C] = I
                            }
                            return R && (c.node.timestamp = Date.now()), R
                        },
                        write(c, m, M, S, L) {
                            for (var R = 0; R < S; R++) try {
                                e(m[M + R])
                            } catch {
                                throw new FS.ErrnoError(29)
                            }
                            return S && (c.node.timestamp = Date.now()), R
                        }
                    }), FS.mkdev(a, _, u)
                },
                forceLoadFile(r) {
                    if (r.isDevice || r.isFolder || r.link || r.contents) return !0;
                    if (typeof XMLHttpRequest < "u") throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
                    if (read_) try {
                        r.contents = intArrayFromString(read_(r.url), !0), r.usedBytes = r.contents.length
                    } catch {
                        throw new FS.ErrnoError(29)
                    } else throw new Error("Cannot load without read() or XMLHttpRequest.")
                },
                createLazyFile(r, t, n, e, a) {
                    class _ {
                        constructor() {
                            this.lengthKnown = !1, this.chunks = []
                        }
                        get(C) {
                            if (!(C > this.length - 1 || C < 0)) {
                                var I = C % this.chunkSize,
                                    T = C / this.chunkSize | 0;
                                return this.getter(T)[I]
                            }
                        }
                        setDataGetter(C) {
                            this.getter = C
                        }
                        cacheLength() {
                            var C = new XMLHttpRequest;
                            if (C.open("HEAD", n, !1), C.send(null), !(C.status >= 200 && C.status < 300 || C.status === 304)) throw new Error("Couldn't load " + n + ". Status: " + C.status);
                            var I = Number(C.getResponseHeader("Content-length")),
                                T, w = (T = C.getResponseHeader("Accept-Ranges")) && T === "bytes",
                                A = (T = C.getResponseHeader("Content-Encoding")) && T === "gzip",
                                h = 1024 * 1024;
                            w || (h = I);
                            var G = (D, f) => {
                                    if (D > f) throw new Error("invalid range (" + D + ", " + f + ") or no bytes requested!");
                                    if (f > I - 1) throw new Error("only " + I + " bytes available! programmer error!");
                                    var g = new XMLHttpRequest;
                                    if (g.open("GET", n, !1), I !== h && g.setRequestHeader("Range", "bytes=" + D + "-" + f), g.responseType = "arraybuffer", g.overrideMimeType && g.overrideMimeType("text/plain; charset=x-user-defined"), g.send(null), !(g.status >= 200 && g.status < 300 || g.status === 304)) throw new Error("Couldn't load " + n + ". Status: " + g.status);
                                    return g.response !== void 0 ? new Uint8Array(g.response || []) : intArrayFromString(g.responseText || "")
                                },
                                O = this;
                            O.setDataGetter(D => {
                                var f = D * h,
                                    g = (D + 1) * h - 1;
                                if (g = Math.min(g, I - 1), typeof O.chunks[D] > "u" && (O.chunks[D] = G(f, g)), typeof O.chunks[D] > "u") throw new Error("doXHR failed!");
                                return O.chunks[D]
                            }), (A || !I) && (h = I = 1, I = this.getter(0).length, h = I, out("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = I, this._chunkSize = h, this.lengthKnown = !0
                        }
                        get length() {
                            return this.lengthKnown || this.cacheLength(), this._length
                        }
                        get chunkSize() {
                            return this.lengthKnown || this.cacheLength(), this._chunkSize
                        }
                    }
                    if (typeof XMLHttpRequest < "u") {
                        throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                        var u, c
                    } else var c = {
                        isDevice: !1,
                        url: n
                    };
                    var m = FS.createFile(r, t, c, e, a);
                    c.contents ? m.contents = c.contents : c.url && (m.contents = null, m.url = c.url), Object.defineProperties(m, {
                        usedBytes: {
                            get: function() {
                                return this.contents.length
                            }
                        }
                    });
                    var M = {},
                        S = Object.keys(m.stream_ops);
                    S.forEach(R => {
                        var C = m.stream_ops[R];
                        M[R] = (...I) => (FS.forceLoadFile(m), C(...I))
                    });

                    function L(R, C, I, T, w) {
                        var A = R.node.contents;
                        if (w >= A.length) return 0;
                        var h = Math.min(A.length - w, T);
                        if (A.slice)
                            for (var G = 0; G < h; G++) C[I + G] = A[w + G];
                        else
                            for (var G = 0; G < h; G++) C[I + G] = A.get(w + G);
                        return h
                    }
                    return M.read = (R, C, I, T, w) => (FS.forceLoadFile(m), L(R, C, I, T, w)), M.mmap = (R, C, I, T, w) => {
                        FS.forceLoadFile(m);
                        var A = mmapAlloc();
                        if (!A) throw new FS.ErrnoError(48);
                        return L(R, HEAP8, A, C, I), {
                            ptr: A,
                            allocated: !0
                        }
                    }, m.stream_ops = M, m
                }
            },
            UTF8ToString = (r, t) => r ? UTF8ArrayToString(HEAPU8, r, t) : "",
            SYSCALLS = {
                DEFAULT_POLLMASK: 5,
                calculateAt(r, t, n) {
                    if (PATH.isAbs(t)) return t;
                    var e;
                    if (r === -100) e = FS.cwd();
                    else {
                        var a = SYSCALLS.getStreamFromFD(r);
                        e = a.path
                    }
                    if (t.length == 0) {
                        if (!n) throw new FS.ErrnoError(44);
                        return e
                    }
                    return PATH.join2(e, t)
                },
                doStat(r, t, n) {
                    var e = r(t);
                    HEAP32[n >> 2] = e.dev, HEAP32[n + 4 >> 2] = e.mode, HEAPU32[n + 8 >> 2] = e.nlink, HEAP32[n + 12 >> 2] = e.uid, HEAP32[n + 16 >> 2] = e.gid, HEAP32[n + 20 >> 2] = e.rdev, tempI64 = [e.size >>> 0, (tempDouble = e.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[n + 24 >> 2] = tempI64[0], HEAP32[n + 28 >> 2] = tempI64[1], HEAP32[n + 32 >> 2] = 4096, HEAP32[n + 36 >> 2] = e.blocks;
                    var a = e.atime.getTime(),
                        _ = e.mtime.getTime(),
                        u = e.ctime.getTime();
                    return tempI64 = [Math.floor(a / 1e3) >>> 0, (tempDouble = Math.floor(a / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[n + 40 >> 2] = tempI64[0], HEAP32[n + 44 >> 2] = tempI64[1], HEAPU32[n + 48 >> 2] = a % 1e3 * 1e3, tempI64 = [Math.floor(_ / 1e3) >>> 0, (tempDouble = Math.floor(_ / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[n + 56 >> 2] = tempI64[0], HEAP32[n + 60 >> 2] = tempI64[1], HEAPU32[n + 64 >> 2] = _ % 1e3 * 1e3, tempI64 = [Math.floor(u / 1e3) >>> 0, (tempDouble = Math.floor(u / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[n + 72 >> 2] = tempI64[0], HEAP32[n + 76 >> 2] = tempI64[1], HEAPU32[n + 80 >> 2] = u % 1e3 * 1e3, tempI64 = [e.ino >>> 0, (tempDouble = e.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[n + 88 >> 2] = tempI64[0], HEAP32[n + 92 >> 2] = tempI64[1], 0
                },
                doMsync(r, t, n, e, a) {
                    if (!FS.isFile(t.node.mode)) throw new FS.ErrnoError(43);
                    if (e & 2) return 0;
                    var _ = HEAPU8.slice(r, r + n);
                    FS.msync(t, _, a, n, e)
                },
                getStreamFromFD(r) {
                    var t = FS.getStreamChecked(r);
                    return t
                },
                varargs: void 0,
                getStr(r) {
                    var t = UTF8ToString(r);
                    return t
                }
            };

        function ___syscall_chdir(r) {
            try {
                return r = SYSCALLS.getStr(r), FS.chdir(r), 0
            } catch (t) {
                if (typeof FS > "u" || t.name !== "ErrnoError") throw t;
                return -t.errno
            }
        }

        function ___syscall_faccessat(r, t, n, e) {
            try {
                if (t = SYSCALLS.getStr(t), t = SYSCALLS.calculateAt(r, t), n & -8) return -28;
                var a = FS.lookupPath(t, {
                        follow: !0
                    }),
                    _ = a.node;
                if (!_) return -44;
                var u = "";
                return n & 4 && (u += "r"), n & 2 && (u += "w"), n & 1 && (u += "x"), u && FS.nodePermissions(_, u) ? -2 : 0
            } catch (c) {
                if (typeof FS > "u" || c.name !== "ErrnoError") throw c;
                return -c.errno
            }
        }

        function syscallGetVarargI() {
            var r = HEAP32[+SYSCALLS.varargs >> 2];
            return SYSCALLS.varargs += 4, r
        }
        var syscallGetVarargP = syscallGetVarargI;

        function ___syscall_fcntl64(r, t, n) {
            SYSCALLS.varargs = n;
            try {
                var e = SYSCALLS.getStreamFromFD(r);
                switch (t) {
                    case 0: {
                        var a = syscallGetVarargI();
                        if (a < 0) return -28;
                        for (; FS.streams[a];) a++;
                        var _;
                        return _ = FS.dupStream(e, a), _.fd
                    }
                    case 1:
                    case 2:
                        return 0;
                    case 3:
                        return e.flags;
                    case 4: {
                        var a = syscallGetVarargI();
                        return e.flags |= a, 0
                    }
                    case 12: {
                        var a = syscallGetVarargP(),
                            u = 0;
                        return HEAP16[a + u >> 1] = 2, 0
                    }
                    case 13:
                    case 14:
                        return 0
                }
                return -28
            } catch (c) {
                if (typeof FS > "u" || c.name !== "ErrnoError") throw c;
                return -c.errno
            }
        }
        var stringToUTF8 = (r, t, n) => stringToUTF8Array(r, HEAPU8, t, n);

        function ___syscall_getcwd(r, t) {
            try {
                if (t === 0) return -28;
                var n = FS.cwd(),
                    e = lengthBytesUTF8(n) + 1;
                return t < e ? -68 : (stringToUTF8(n, r, t), e)
            } catch (a) {
                if (typeof FS > "u" || a.name !== "ErrnoError") throw a;
                return -a.errno
            }
        }

        function ___syscall_getdents64(r, t, n) {
            try {
                var e = SYSCALLS.getStreamFromFD(r);
                e.getdents || (e.getdents = FS.readdir(e.path));
                for (var a = 280, _ = 0, u = FS.llseek(e, 0, 1), c = Math.floor(u / a); c < e.getdents.length && _ + a <= n;) {
                    var m, M, S = e.getdents[c];
                    if (S === ".") m = e.node.id, M = 4;
                    else if (S === "..") {
                        var L = FS.lookupPath(e.path, {
                            parent: !0
                        });
                        m = L.node.id, M = 4
                    } else {
                        var R = FS.lookupNode(e.node, S);
                        m = R.id, M = FS.isChrdev(R.mode) ? 2 : FS.isDir(R.mode) ? 4 : FS.isLink(R.mode) ? 10 : 8
                    }
                    tempI64 = [m >>> 0, (tempDouble = m, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[t + _ >> 2] = tempI64[0], HEAP32[t + _ + 4 >> 2] = tempI64[1], tempI64 = [(c + 1) * a >>> 0, (tempDouble = (c + 1) * a, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[t + _ + 8 >> 2] = tempI64[0], HEAP32[t + _ + 12 >> 2] = tempI64[1], HEAP16[t + _ + 16 >> 1] = 280, HEAP8[t + _ + 18] = M, stringToUTF8(S, t + _ + 19, 256), _ += a, c += 1
                }
                return FS.llseek(e, c * a, 0), _
            } catch (C) {
                if (typeof FS > "u" || C.name !== "ErrnoError") throw C;
                return -C.errno
            }
        }

        function ___syscall_ioctl(r, t, n) {
            SYSCALLS.varargs = n;
            try {
                var e = SYSCALLS.getStreamFromFD(r);
                switch (t) {
                    case 21509:
                        return e.tty ? 0 : -59;
                    case 21505: {
                        if (!e.tty) return -59;
                        if (e.tty.ops.ioctl_tcgets) {
                            var a = e.tty.ops.ioctl_tcgets(e),
                                _ = syscallGetVarargP();
                            HEAP32[_ >> 2] = a.c_iflag || 0, HEAP32[_ + 4 >> 2] = a.c_oflag || 0, HEAP32[_ + 8 >> 2] = a.c_cflag || 0, HEAP32[_ + 12 >> 2] = a.c_lflag || 0;
                            for (var u = 0; u < 32; u++) HEAP8[_ + u + 17] = a.c_cc[u] || 0;
                            return 0
                        }
                        return 0
                    }
                    case 21510:
                    case 21511:
                    case 21512:
                        return e.tty ? 0 : -59;
                    case 21506:
                    case 21507:
                    case 21508: {
                        if (!e.tty) return -59;
                        if (e.tty.ops.ioctl_tcsets) {
                            for (var _ = syscallGetVarargP(), c = HEAP32[_ >> 2], m = HEAP32[_ + 4 >> 2], M = HEAP32[_ + 8 >> 2], S = HEAP32[_ + 12 >> 2], L = [], u = 0; u < 32; u++) L.push(HEAP8[_ + u + 17]);
                            return e.tty.ops.ioctl_tcsets(e.tty, t, {
                                c_iflag: c,
                                c_oflag: m,
                                c_cflag: M,
                                c_lflag: S,
                                c_cc: L
                            })
                        }
                        return 0
                    }
                    case 21519: {
                        if (!e.tty) return -59;
                        var _ = syscallGetVarargP();
                        return HEAP32[_ >> 2] = 0, 0
                    }
                    case 21520:
                        return e.tty ? -28 : -59;
                    case 21531: {
                        var _ = syscallGetVarargP();
                        return FS.ioctl(e, t, _)
                    }
                    case 21523: {
                        if (!e.tty) return -59;
                        if (e.tty.ops.ioctl_tiocgwinsz) {
                            var R = e.tty.ops.ioctl_tiocgwinsz(e.tty),
                                _ = syscallGetVarargP();
                            HEAP16[_ >> 1] = R[0], HEAP16[_ + 2 >> 1] = R[1]
                        }
                        return 0
                    }
                    case 21524:
                        return e.tty ? 0 : -59;
                    case 21515:
                        return e.tty ? 0 : -59;
                    default:
                        return -28
                }
            } catch (C) {
                if (typeof FS > "u" || C.name !== "ErrnoError") throw C;
                return -C.errno
            }
        }

        function ___syscall_openat(r, t, n, e) {
            SYSCALLS.varargs = e;
            try {
                t = SYSCALLS.getStr(t), t = SYSCALLS.calculateAt(r, t);
                var a = e ? syscallGetVarargI() : 0;
                return FS.open(t, n, a).fd
            } catch (_) {
                if (typeof FS > "u" || _.name !== "ErrnoError") throw _;
                return -_.errno
            }
        }

        function ___syscall_stat64(r, t) {
            try {
                return r = SYSCALLS.getStr(r), SYSCALLS.doStat(FS.stat, r, t)
            } catch (n) {
                if (typeof FS > "u" || n.name !== "ErrnoError") throw n;
                return -n.errno
            }
        }
        var __emscripten_memcpy_js = (r, t, n) => HEAPU8.copyWithin(r, t, t + n),
            readEmAsmArgsArray = [],
            readEmAsmArgs = (r, t) => {
                readEmAsmArgsArray.length = 0;
                for (var n; n = HEAPU8[r++];) {
                    var e = n != 105;
                    e &= n != 112, t += e && t % 8 ? 4 : 0, readEmAsmArgsArray.push(n == 112 ? HEAPU32[t >> 2] : n == 105 ? HEAP32[t >> 2] : HEAPF64[t >> 3]), t += e ? 8 : 4
                }
                return readEmAsmArgsArray
            },
            runEmAsmFunction = (r, t, n) => {
                var e = readEmAsmArgs(t, n);
                return ASM_CONSTS[r](...e)
            },
            _emscripten_asm_const_int = (r, t, n) => runEmAsmFunction(r, t, n),
            _emscripten_date_now = () => Date.now(),
            JSEvents = {
                removeAllEventListeners() {
                    for (; JSEvents.eventHandlers.length;) JSEvents._removeHandler(JSEvents.eventHandlers.length - 1);
                    JSEvents.deferredCalls = []
                },
                inEventHandler: 0,
                deferredCalls: [],
                deferCall(r, t, n) {
                    function e(u, c) {
                        if (u.length != c.length) return !1;
                        for (var m in u)
                            if (u[m] != c[m]) return !1;
                        return !0
                    }
                    for (var a in JSEvents.deferredCalls) {
                        var _ = JSEvents.deferredCalls[a];
                        if (_.targetFunction == r && e(_.argsList, n)) return
                    }
                    JSEvents.deferredCalls.push({
                        targetFunction: r,
                        precedence: t,
                        argsList: n
                    }), JSEvents.deferredCalls.sort((u, c) => u.precedence < c.precedence)
                },
                removeDeferredCalls(r) {
                    for (var t = 0; t < JSEvents.deferredCalls.length; ++t) JSEvents.deferredCalls[t].targetFunction == r && (JSEvents.deferredCalls.splice(t, 1), --t)
                },
                canPerformEventHandlerRequests() {
                    return navigator.userActivation ? navigator.userActivation.isActive : JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
                },
                runDeferredCalls() {
                    if (JSEvents.canPerformEventHandlerRequests())
                        for (var r = 0; r < JSEvents.deferredCalls.length; ++r) {
                            var t = JSEvents.deferredCalls[r];
                            JSEvents.deferredCalls.splice(r, 1), --r, t.targetFunction(...t.argsList)
                        }
                },
                eventHandlers: [],
                removeAllHandlersOnTarget: (r, t) => {
                    for (var n = 0; n < JSEvents.eventHandlers.length; ++n) JSEvents.eventHandlers[n].target == r && (!t || t == JSEvents.eventHandlers[n].eventTypeString) && JSEvents._removeHandler(n--)
                },
                _removeHandler(r) {
                    var t = JSEvents.eventHandlers[r];
                    t.target.removeEventListener(t.eventTypeString, t.eventListenerFunc, t.useCapture), JSEvents.eventHandlers.splice(r, 1)
                },
                registerOrRemoveHandler(r) {
                    if (!r.target) return -4;
                    if (r.callbackfunc) r.eventListenerFunc = function(n) {
                        ++JSEvents.inEventHandler, JSEvents.currentEventHandler = r, JSEvents.runDeferredCalls(), r.handlerFunc(n), JSEvents.runDeferredCalls(), --JSEvents.inEventHandler
                    }, r.target.addEventListener(r.eventTypeString, r.eventListenerFunc, r.useCapture), JSEvents.eventHandlers.push(r);
                    else
                        for (var t = 0; t < JSEvents.eventHandlers.length; ++t) JSEvents.eventHandlers[t].target == r.target && JSEvents.eventHandlers[t].eventTypeString == r.eventTypeString && JSEvents._removeHandler(t--);
                    return 0
                },
                getNodeNameForTarget(r) {
                    return r ? r == window ? "#window" : r == screen ? "#screen" : (r == null ? void 0 : r.nodeName) || "" : ""
                },
                fullscreenEnabled() {
                    return document.fullscreenEnabled || document.webkitFullscreenEnabled
                }
            },
            requestPointerLock = r => {
                if (r.requestPointerLock) r.requestPointerLock();
                else return document.body.requestPointerLock ? -3 : -1;
                return 0
            },
            _emscripten_exit_pointerlock = () => {
                if (JSEvents.removeDeferredCalls(requestPointerLock), document.exitPointerLock) document.exitPointerLock();
                else return -1;
                return 0
            },
            maybeCStringToJsString = r => r > 2 ? UTF8ToString(r) : r,
            specialHTMLTargets = [0, document, window],
            findEventTarget = r => {
                r = maybeCStringToJsString(r);
                var t = specialHTMLTargets[r] || document.querySelector(r);
                return t
            },
            getBoundingClientRect = r => specialHTMLTargets.indexOf(r) < 0 ? r.getBoundingClientRect() : {
                left: 0,
                top: 0
            },
            _emscripten_get_element_css_size = (r, t, n) => {
                if (r = findEventTarget(r), !r) return -4;
                var e = getBoundingClientRect(r);
                return HEAPF64[t >> 3] = e.width, HEAPF64[n >> 3] = e.height, 0
            },
            fillGamepadEventData = (r, t) => {
                HEAPF64[r >> 3] = t.timestamp;
                for (var n = 0; n < t.axes.length; ++n) HEAPF64[r + n * 8 + 16 >> 3] = t.axes[n];
                for (var n = 0; n < t.buttons.length; ++n) typeof t.buttons[n] == "object" ? HEAPF64[r + n * 8 + 528 >> 3] = t.buttons[n].value : HEAPF64[r + n * 8 + 528 >> 3] = t.buttons[n];
                for (var n = 0; n < t.buttons.length; ++n) typeof t.buttons[n] == "object" ? HEAP32[r + n * 4 + 1040 >> 2] = t.buttons[n].pressed : HEAP32[r + n * 4 + 1040 >> 2] = t.buttons[n] == 1;
                HEAP32[r + 1296 >> 2] = t.connected, HEAP32[r + 1300 >> 2] = t.index, HEAP32[r + 8 >> 2] = t.axes.length, HEAP32[r + 12 >> 2] = t.buttons.length, stringToUTF8(t.id, r + 1304, 64), stringToUTF8(t.mapping, r + 1368, 64)
            },
            _emscripten_get_gamepad_status = (r, t) => r < 0 || r >= JSEvents.lastGamepadState.length ? -5 : JSEvents.lastGamepadState[r] ? (fillGamepadEventData(t, JSEvents.lastGamepadState[r]), 0) : -7,
            _emscripten_get_now;
        _emscripten_get_now = () => performance.now();
        var _emscripten_get_num_gamepads = () => JSEvents.lastGamepadState.length,
            webgl_enable_ANGLE_instanced_arrays = r => {
                var t = r.getExtension("ANGLE_instanced_arrays");
                if (t) return r.vertexAttribDivisor = (n, e) => t.vertexAttribDivisorANGLE(n, e), r.drawArraysInstanced = (n, e, a, _) => t.drawArraysInstancedANGLE(n, e, a, _), r.drawElementsInstanced = (n, e, a, _, u) => t.drawElementsInstancedANGLE(n, e, a, _, u), 1
            },
            webgl_enable_OES_vertex_array_object = r => {
                var t = r.getExtension("OES_vertex_array_object");
                if (t) return r.createVertexArray = () => t.createVertexArrayOES(), r.deleteVertexArray = n => t.deleteVertexArrayOES(n), r.bindVertexArray = n => t.bindVertexArrayOES(n), r.isVertexArray = n => t.isVertexArrayOES(n), 1
            },
            webgl_enable_WEBGL_draw_buffers = r => {
                var t = r.getExtension("WEBGL_draw_buffers");
                if (t) return r.drawBuffers = (n, e) => t.drawBuffersWEBGL(n, e), 1
            },
            webgl_enable_WEBGL_multi_draw = r => !!(r.multiDrawWebgl = r.getExtension("WEBGL_multi_draw")),
            getEmscriptenSupportedExtensions = r => {
                var t = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw"];
                return (r.getSupportedExtensions() || []).filter(n => t.includes(n))
            },
            GL = {
                counter: 1,
                buffers: [],
                programs: [],
                framebuffers: [],
                renderbuffers: [],
                textures: [],
                shaders: [],
                vaos: [],
                contexts: [],
                offscreenCanvases: {},
                queries: [],
                stringCache: {},
                unpackAlignment: 4,
                recordError: r => {
                    GL.lastError || (GL.lastError = r)
                },
                getNewId: r => {
                    for (var t = GL.counter++, n = r.length; n < t; n++) r[n] = null;
                    return t
                },
                genObject: (r, t, n, e) => {
                    for (var a = 0; a < r; a++) {
                        var _ = GLctx[n](),
                            u = _ && GL.getNewId(e);
                        _ ? (_.name = u, e[u] = _) : GL.recordError(1282), HEAP32[t + a * 4 >> 2] = u
                    }
                },
                getSource: (r, t, n, e) => {
                    for (var a = "", _ = 0; _ < t; ++_) {
                        var u = e ? HEAPU32[e + _ * 4 >> 2] : void 0;
                        a += UTF8ToString(HEAPU32[n + _ * 4 >> 2], u)
                    }
                    return a
                },
                createContext: (r, t) => {
                    if (!r.getContextSafariWebGL2Fixed) {
                        let a = function(_, u) {
                            var c = r.getContextSafariWebGL2Fixed(_, u);
                            return _ == "webgl" == c instanceof WebGLRenderingContext ? c : null
                        };
                        r.getContextSafariWebGL2Fixed = r.getContext, r.getContext = a
                    }
                    var n = r.getContext("webgl", t);
                    if (!n) return 0;
                    var e = GL.registerContext(n, t);
                    return e
                },
                registerContext: (r, t) => {
                    var n = GL.getNewId(GL.contexts),
                        e = {
                            handle: n,
                            attributes: t,
                            version: t.majorVersion,
                            GLctx: r
                        };
                    return r.canvas && (r.canvas.GLctxObject = e), GL.contexts[n] = e, (typeof t.enableExtensionsByDefault > "u" || t.enableExtensionsByDefault) && GL.initExtensions(e), n
                },
                makeContextCurrent: r => {
                    var t;
                    return GL.currentContext = GL.contexts[r], Module.ctx = GLctx = (t = GL.currentContext) == null ? void 0 : t.GLctx, !(r && !GLctx)
                },
                getContext: r => GL.contexts[r],
                deleteContext: r => {
                    GL.currentContext === GL.contexts[r] && (GL.currentContext = null), typeof JSEvents == "object" && JSEvents.removeAllHandlersOnTarget(GL.contexts[r].GLctx.canvas), GL.contexts[r] && GL.contexts[r].GLctx.canvas && (GL.contexts[r].GLctx.canvas.GLctxObject = void 0), GL.contexts[r] = null
                },
                initExtensions: r => {
                    if (r || (r = GL.currentContext), !r.initExtensionsDone) {
                        r.initExtensionsDone = !0;
                        var t = r.GLctx;
                        webgl_enable_ANGLE_instanced_arrays(t), webgl_enable_OES_vertex_array_object(t), webgl_enable_WEBGL_draw_buffers(t), t.disjointTimerQueryExt = t.getExtension("EXT_disjoint_timer_query"), webgl_enable_WEBGL_multi_draw(t), getEmscriptenSupportedExtensions(t).forEach(n => {
                            !n.includes("lose_context") && !n.includes("debug") && t.getExtension(n)
                        })
                    }
                }
            },
            _glActiveTexture = r => GLctx.activeTexture(r),
            _emscripten_glActiveTexture = _glActiveTexture,
            _glAttachShader = (r, t) => {
                GLctx.attachShader(GL.programs[r], GL.shaders[t])
            },
            _emscripten_glAttachShader = _glAttachShader,
            _glBeginQueryEXT = (r, t) => {
                GLctx.disjointTimerQueryExt.beginQueryEXT(r, GL.queries[t])
            },
            _emscripten_glBeginQueryEXT = _glBeginQueryEXT,
            _glBindAttribLocation = (r, t, n) => {
                GLctx.bindAttribLocation(GL.programs[r], t, UTF8ToString(n))
            },
            _emscripten_glBindAttribLocation = _glBindAttribLocation,
            _glBindBuffer = (r, t) => {
                GLctx.bindBuffer(r, GL.buffers[t])
            },
            _emscripten_glBindBuffer = _glBindBuffer,
            _glBindFramebuffer = (r, t) => {
                GLctx.bindFramebuffer(r, GL.framebuffers[t])
            },
            _emscripten_glBindFramebuffer = _glBindFramebuffer,
            _glBindRenderbuffer = (r, t) => {
                GLctx.bindRenderbuffer(r, GL.renderbuffers[t])
            },
            _emscripten_glBindRenderbuffer = _glBindRenderbuffer,
            _glBindTexture = (r, t) => {
                GLctx.bindTexture(r, GL.textures[t])
            },
            _emscripten_glBindTexture = _glBindTexture,
            _glBindVertexArray = r => {
                GLctx.bindVertexArray(GL.vaos[r])
            },
            _glBindVertexArrayOES = _glBindVertexArray,
            _emscripten_glBindVertexArrayOES = _glBindVertexArrayOES,
            _glBlendColor = (r, t, n, e) => GLctx.blendColor(r, t, n, e),
            _emscripten_glBlendColor = _glBlendColor,
            _glBlendEquation = r => GLctx.blendEquation(r),
            _emscripten_glBlendEquation = _glBlendEquation,
            _glBlendEquationSeparate = (r, t) => GLctx.blendEquationSeparate(r, t),
            _emscripten_glBlendEquationSeparate = _glBlendEquationSeparate,
            _glBlendFunc = (r, t) => GLctx.blendFunc(r, t),
            _emscripten_glBlendFunc = _glBlendFunc,
            _glBlendFuncSeparate = (r, t, n, e) => GLctx.blendFuncSeparate(r, t, n, e),
            _emscripten_glBlendFuncSeparate = _glBlendFuncSeparate,
            _glBufferData = (r, t, n, e) => {
                GLctx.bufferData(r, n ? HEAPU8.subarray(n, n + t) : t, e)
            },
            _emscripten_glBufferData = _glBufferData,
            _glBufferSubData = (r, t, n, e) => {
                GLctx.bufferSubData(r, t, HEAPU8.subarray(e, e + n))
            },
            _emscripten_glBufferSubData = _glBufferSubData,
            _glCheckFramebufferStatus = r => GLctx.checkFramebufferStatus(r),
            _emscripten_glCheckFramebufferStatus = _glCheckFramebufferStatus,
            _glClear = r => GLctx.clear(r),
            _emscripten_glClear = _glClear,
            _glClearColor = (r, t, n, e) => GLctx.clearColor(r, t, n, e),
            _emscripten_glClearColor = _glClearColor,
            _glClearDepthf = r => GLctx.clearDepth(r),
            _emscripten_glClearDepthf = _glClearDepthf,
            _glClearStencil = r => GLctx.clearStencil(r),
            _emscripten_glClearStencil = _glClearStencil,
            _glColorMask = (r, t, n, e) => {
                GLctx.colorMask(!!r, !!t, !!n, !!e)
            },
            _emscripten_glColorMask = _glColorMask,
            _glCompileShader = r => {
                GLctx.compileShader(GL.shaders[r])
            },
            _emscripten_glCompileShader = _glCompileShader,
            _glCompressedTexImage2D = (r, t, n, e, a, _, u, c) => {
                GLctx.compressedTexImage2D(r, t, n, e, a, _, c ? HEAPU8.subarray(c, c + u) : null)
            },
            _emscripten_glCompressedTexImage2D = _glCompressedTexImage2D,
            _glCompressedTexSubImage2D = (r, t, n, e, a, _, u, c, m) => {
                GLctx.compressedTexSubImage2D(r, t, n, e, a, _, u, m ? HEAPU8.subarray(m, m + c) : null)
            },
            _emscripten_glCompressedTexSubImage2D = _glCompressedTexSubImage2D,
            _glCopyTexImage2D = (r, t, n, e, a, _, u, c) => GLctx.copyTexImage2D(r, t, n, e, a, _, u, c),
            _emscripten_glCopyTexImage2D = _glCopyTexImage2D,
            _glCopyTexSubImage2D = (r, t, n, e, a, _, u, c) => GLctx.copyTexSubImage2D(r, t, n, e, a, _, u, c),
            _emscripten_glCopyTexSubImage2D = _glCopyTexSubImage2D,
            _glCreateProgram = () => {
                var r = GL.getNewId(GL.programs),
                    t = GLctx.createProgram();
                return t.name = r, t.maxUniformLength = t.maxAttributeLength = t.maxUniformBlockNameLength = 0, t.uniformIdCounter = 1, GL.programs[r] = t, r
            },
            _emscripten_glCreateProgram = _glCreateProgram,
            _glCreateShader = r => {
                var t = GL.getNewId(GL.shaders);
                return GL.shaders[t] = GLctx.createShader(r), t
            },
            _emscripten_glCreateShader = _glCreateShader,
            _glCullFace = r => GLctx.cullFace(r),
            _emscripten_glCullFace = _glCullFace,
            _glDeleteBuffers = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = HEAP32[t + n * 4 >> 2],
                        a = GL.buffers[e];
                    a && (GLctx.deleteBuffer(a), a.name = 0, GL.buffers[e] = null)
                }
            },
            _emscripten_glDeleteBuffers = _glDeleteBuffers,
            _glDeleteFramebuffers = (r, t) => {
                for (var n = 0; n < r; ++n) {
                    var e = HEAP32[t + n * 4 >> 2],
                        a = GL.framebuffers[e];
                    a && (GLctx.deleteFramebuffer(a), a.name = 0, GL.framebuffers[e] = null)
                }
            },
            _emscripten_glDeleteFramebuffers = _glDeleteFramebuffers,
            _glDeleteProgram = r => {
                if (r) {
                    var t = GL.programs[r];
                    if (!t) {
                        GL.recordError(1281);
                        return
                    }
                    GLctx.deleteProgram(t), t.name = 0, GL.programs[r] = null
                }
            },
            _emscripten_glDeleteProgram = _glDeleteProgram,
            _glDeleteQueriesEXT = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = HEAP32[t + n * 4 >> 2],
                        a = GL.queries[e];
                    a && (GLctx.disjointTimerQueryExt.deleteQueryEXT(a), GL.queries[e] = null)
                }
            },
            _emscripten_glDeleteQueriesEXT = _glDeleteQueriesEXT,
            _glDeleteRenderbuffers = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = HEAP32[t + n * 4 >> 2],
                        a = GL.renderbuffers[e];
                    a && (GLctx.deleteRenderbuffer(a), a.name = 0, GL.renderbuffers[e] = null)
                }
            },
            _emscripten_glDeleteRenderbuffers = _glDeleteRenderbuffers,
            _glDeleteShader = r => {
                if (r) {
                    var t = GL.shaders[r];
                    if (!t) {
                        GL.recordError(1281);
                        return
                    }
                    GLctx.deleteShader(t), GL.shaders[r] = null
                }
            },
            _emscripten_glDeleteShader = _glDeleteShader,
            _glDeleteTextures = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = HEAP32[t + n * 4 >> 2],
                        a = GL.textures[e];
                    a && (GLctx.deleteTexture(a), a.name = 0, GL.textures[e] = null)
                }
            },
            _emscripten_glDeleteTextures = _glDeleteTextures,
            _glDeleteVertexArrays = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = HEAP32[t + n * 4 >> 2];
                    GLctx.deleteVertexArray(GL.vaos[e]), GL.vaos[e] = null
                }
            },
            _glDeleteVertexArraysOES = _glDeleteVertexArrays,
            _emscripten_glDeleteVertexArraysOES = _glDeleteVertexArraysOES,
            _glDepthFunc = r => GLctx.depthFunc(r),
            _emscripten_glDepthFunc = _glDepthFunc,
            _glDepthMask = r => {
                GLctx.depthMask(!!r)
            },
            _emscripten_glDepthMask = _glDepthMask,
            _glDepthRangef = (r, t) => GLctx.depthRange(r, t),
            _emscripten_glDepthRangef = _glDepthRangef,
            _glDetachShader = (r, t) => {
                GLctx.detachShader(GL.programs[r], GL.shaders[t])
            },
            _emscripten_glDetachShader = _glDetachShader,
            _glDisable = r => GLctx.disable(r),
            _emscripten_glDisable = _glDisable,
            _glDisableVertexAttribArray = r => {
                GLctx.disableVertexAttribArray(r)
            },
            _emscripten_glDisableVertexAttribArray = _glDisableVertexAttribArray,
            _glDrawArrays = (r, t, n) => {
                GLctx.drawArrays(r, t, n)
            },
            _emscripten_glDrawArrays = _glDrawArrays,
            _glDrawArraysInstanced = (r, t, n, e) => {
                GLctx.drawArraysInstanced(r, t, n, e)
            },
            _glDrawArraysInstancedANGLE = _glDrawArraysInstanced,
            _emscripten_glDrawArraysInstancedANGLE = _glDrawArraysInstancedANGLE,
            tempFixedLengthArray = [],
            _glDrawBuffers = (r, t) => {
                for (var n = tempFixedLengthArray[r], e = 0; e < r; e++) n[e] = HEAP32[t + e * 4 >> 2];
                GLctx.drawBuffers(n)
            },
            _glDrawBuffersWEBGL = _glDrawBuffers,
            _emscripten_glDrawBuffersWEBGL = _glDrawBuffersWEBGL,
            _glDrawElements = (r, t, n, e) => {
                GLctx.drawElements(r, t, n, e)
            },
            _emscripten_glDrawElements = _glDrawElements,
            _glDrawElementsInstanced = (r, t, n, e, a) => {
                GLctx.drawElementsInstanced(r, t, n, e, a)
            },
            _glDrawElementsInstancedANGLE = _glDrawElementsInstanced,
            _emscripten_glDrawElementsInstancedANGLE = _glDrawElementsInstancedANGLE,
            _glEnable = r => GLctx.enable(r),
            _emscripten_glEnable = _glEnable,
            _glEnableVertexAttribArray = r => {
                GLctx.enableVertexAttribArray(r)
            },
            _emscripten_glEnableVertexAttribArray = _glEnableVertexAttribArray,
            _glEndQueryEXT = r => {
                GLctx.disjointTimerQueryExt.endQueryEXT(r)
            },
            _emscripten_glEndQueryEXT = _glEndQueryEXT,
            _glFinish = () => GLctx.finish(),
            _emscripten_glFinish = _glFinish,
            _glFlush = () => GLctx.flush(),
            _emscripten_glFlush = _glFlush,
            _glFramebufferRenderbuffer = (r, t, n, e) => {
                GLctx.framebufferRenderbuffer(r, t, n, GL.renderbuffers[e])
            },
            _emscripten_glFramebufferRenderbuffer = _glFramebufferRenderbuffer,
            _glFramebufferTexture2D = (r, t, n, e, a) => {
                GLctx.framebufferTexture2D(r, t, n, GL.textures[e], a)
            },
            _emscripten_glFramebufferTexture2D = _glFramebufferTexture2D,
            _glFrontFace = r => GLctx.frontFace(r),
            _emscripten_glFrontFace = _glFrontFace,
            _glGenBuffers = (r, t) => {
                GL.genObject(r, t, "createBuffer", GL.buffers)
            },
            _emscripten_glGenBuffers = _glGenBuffers,
            _glGenFramebuffers = (r, t) => {
                GL.genObject(r, t, "createFramebuffer", GL.framebuffers)
            },
            _emscripten_glGenFramebuffers = _glGenFramebuffers,
            _glGenQueriesEXT = (r, t) => {
                for (var n = 0; n < r; n++) {
                    var e = GLctx.disjointTimerQueryExt.createQueryEXT();
                    if (!e) {
                        for (GL.recordError(1282); n < r;) HEAP32[t + n++ * 4 >> 2] = 0;
                        return
                    }
                    var a = GL.getNewId(GL.queries);
                    e.name = a, GL.queries[a] = e, HEAP32[t + n * 4 >> 2] = a
                }
            },
            _emscripten_glGenQueriesEXT = _glGenQueriesEXT,
            _glGenRenderbuffers = (r, t) => {
                GL.genObject(r, t, "createRenderbuffer", GL.renderbuffers)
            },
            _emscripten_glGenRenderbuffers = _glGenRenderbuffers,
            _glGenTextures = (r, t) => {
                GL.genObject(r, t, "createTexture", GL.textures)
            },
            _emscripten_glGenTextures = _glGenTextures,
            _glGenVertexArrays = (r, t) => {
                GL.genObject(r, t, "createVertexArray", GL.vaos)
            },
            _glGenVertexArraysOES = _glGenVertexArrays,
            _emscripten_glGenVertexArraysOES = _glGenVertexArraysOES,
            _glGenerateMipmap = r => GLctx.generateMipmap(r),
            _emscripten_glGenerateMipmap = _glGenerateMipmap,
            __glGetActiveAttribOrUniform = (r, t, n, e, a, _, u, c) => {
                t = GL.programs[t];
                var m = GLctx[r](t, n);
                if (m) {
                    var M = c && stringToUTF8(m.name, c, e);
                    a && (HEAP32[a >> 2] = M), _ && (HEAP32[_ >> 2] = m.size), u && (HEAP32[u >> 2] = m.type)
                }
            },
            _glGetActiveAttrib = (r, t, n, e, a, _, u) => {
                __glGetActiveAttribOrUniform("getActiveAttrib", r, t, n, e, a, _, u)
            },
            _emscripten_glGetActiveAttrib = _glGetActiveAttrib,
            _glGetActiveUniform = (r, t, n, e, a, _, u) => {
                __glGetActiveAttribOrUniform("getActiveUniform", r, t, n, e, a, _, u)
            },
            _emscripten_glGetActiveUniform = _glGetActiveUniform,
            _glGetAttachedShaders = (r, t, n, e) => {
                var a = GLctx.getAttachedShaders(GL.programs[r]),
                    _ = a.length;
                _ > t && (_ = t), HEAP32[n >> 2] = _;
                for (var u = 0; u < _; ++u) {
                    var c = GL.shaders.indexOf(a[u]);
                    HEAP32[e + u * 4 >> 2] = c
                }
            },
            _emscripten_glGetAttachedShaders = _glGetAttachedShaders,
            _glGetAttribLocation = (r, t) => GLctx.getAttribLocation(GL.programs[r], UTF8ToString(t)),
            _emscripten_glGetAttribLocation = _glGetAttribLocation,
            writeI53ToI64 = (r, t) => {
                HEAPU32[r >> 2] = t;
                var n = HEAPU32[r >> 2];
                HEAPU32[r + 4 >> 2] = (t - n) / 4294967296
            },
            emscriptenWebGLGet = (r, t, n) => {
                if (!t) {
                    GL.recordError(1281);
                    return
                }
                var e = void 0;
                switch (r) {
                    case 36346:
                        e = 1;
                        break;
                    case 36344:
                        n != 0 && n != 1 && GL.recordError(1280);
                        return;
                    case 36345:
                        e = 0;
                        break;
                    case 34466:
                        var a = GLctx.getParameter(34467);
                        e = a ? a.length : 0;
                        break
                }
                if (e === void 0) {
                    var _ = GLctx.getParameter(r);
                    switch (typeof _) {
                        case "number":
                            e = _;
                            break;
                        case "boolean":
                            e = _ ? 1 : 0;
                            break;
                        case "string":
                            GL.recordError(1280);
                            return;
                        case "object":
                            if (_ === null) switch (r) {
                                case 34964:
                                case 35725:
                                case 34965:
                                case 36006:
                                case 36007:
                                case 32873:
                                case 34229:
                                case 34068: {
                                    e = 0;
                                    break
                                }
                                default: {
                                    GL.recordError(1280);
                                    return
                                }
                            } else if (_ instanceof Float32Array || _ instanceof Uint32Array || _ instanceof Int32Array || _ instanceof Array) {
                                for (var u = 0; u < _.length; ++u) switch (n) {
                                    case 0:
                                        HEAP32[t + u * 4 >> 2] = _[u];
                                        break;
                                    case 2:
                                        HEAPF32[t + u * 4 >> 2] = _[u];
                                        break;
                                    case 4:
                                        HEAP8[t + u] = _[u] ? 1 : 0;
                                        break
                                }
                                return
                            } else try {
                                e = _.name | 0
                            } catch (c) {
                                GL.recordError(1280), err(`GL_INVALID_ENUM in glGet${n}v: Unknown object returned from WebGL getParameter(${r})! (error: ${c})`);
                                return
                            }
                            break;
                        default:
                            GL.recordError(1280), err(`GL_INVALID_ENUM in glGet${n}v: Native code calling glGet${n}v(${r}) and it returns ${_} of type ${typeof _}!`);
                            return
                    }
                }
                switch (n) {
                    case 1:
                        writeI53ToI64(t, e);
                        break;
                    case 0:
                        HEAP32[t >> 2] = e;
                        break;
                    case 2:
                        HEAPF32[t >> 2] = e;
                        break;
                    case 4:
                        HEAP8[t] = e ? 1 : 0;
                        break
                }
            },
            _glGetBooleanv = (r, t) => emscriptenWebGLGet(r, t, 4),
            _emscripten_glGetBooleanv = _glGetBooleanv,
            _glGetBufferParameteriv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAP32[n >> 2] = GLctx.getBufferParameter(r, t)
            },
            _emscripten_glGetBufferParameteriv = _glGetBufferParameteriv,
            _glGetError = () => {
                var r = GLctx.getError() || GL.lastError;
                return GL.lastError = 0, r
            },
            _emscripten_glGetError = _glGetError,
            _glGetFloatv = (r, t) => emscriptenWebGLGet(r, t, 2),
            _emscripten_glGetFloatv = _glGetFloatv,
            _glGetFramebufferAttachmentParameteriv = (r, t, n, e) => {
                var a = GLctx.getFramebufferAttachmentParameter(r, t, n);
                (a instanceof WebGLRenderbuffer || a instanceof WebGLTexture) && (a = a.name | 0), HEAP32[e >> 2] = a
            },
            _emscripten_glGetFramebufferAttachmentParameteriv = _glGetFramebufferAttachmentParameteriv,
            _glGetIntegerv = (r, t) => emscriptenWebGLGet(r, t, 0),
            _emscripten_glGetIntegerv = _glGetIntegerv,
            _glGetProgramInfoLog = (r, t, n, e) => {
                var a = GLctx.getProgramInfoLog(GL.programs[r]);
                a === null && (a = "(unknown error)");
                var _ = t > 0 && e ? stringToUTF8(a, e, t) : 0;
                n && (HEAP32[n >> 2] = _)
            },
            _emscripten_glGetProgramInfoLog = _glGetProgramInfoLog,
            _glGetProgramiv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                if (r >= GL.counter) {
                    GL.recordError(1281);
                    return
                }
                if (r = GL.programs[r], t == 35716) {
                    var e = GLctx.getProgramInfoLog(r);
                    e === null && (e = "(unknown error)"), HEAP32[n >> 2] = e.length + 1
                } else if (t == 35719) {
                    if (!r.maxUniformLength)
                        for (var a = 0; a < GLctx.getProgramParameter(r, 35718); ++a) r.maxUniformLength = Math.max(r.maxUniformLength, GLctx.getActiveUniform(r, a).name.length + 1);
                    HEAP32[n >> 2] = r.maxUniformLength
                } else if (t == 35722) {
                    if (!r.maxAttributeLength)
                        for (var a = 0; a < GLctx.getProgramParameter(r, 35721); ++a) r.maxAttributeLength = Math.max(r.maxAttributeLength, GLctx.getActiveAttrib(r, a).name.length + 1);
                    HEAP32[n >> 2] = r.maxAttributeLength
                } else if (t == 35381) {
                    if (!r.maxUniformBlockNameLength)
                        for (var a = 0; a < GLctx.getProgramParameter(r, 35382); ++a) r.maxUniformBlockNameLength = Math.max(r.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(r, a).length + 1);
                    HEAP32[n >> 2] = r.maxUniformBlockNameLength
                } else HEAP32[n >> 2] = GLctx.getProgramParameter(r, t)
            },
            _emscripten_glGetProgramiv = _glGetProgramiv,
            _glGetQueryObjecti64vEXT = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                var e = GL.queries[r],
                    a;
                a = GLctx.disjointTimerQueryExt.getQueryObjectEXT(e, t);
                var _;
                typeof a == "boolean" ? _ = a ? 1 : 0 : _ = a, writeI53ToI64(n, _)
            },
            _emscripten_glGetQueryObjecti64vEXT = _glGetQueryObjecti64vEXT,
            _glGetQueryObjectivEXT = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                var e = GL.queries[r],
                    a = GLctx.disjointTimerQueryExt.getQueryObjectEXT(e, t),
                    _;
                typeof a == "boolean" ? _ = a ? 1 : 0 : _ = a, HEAP32[n >> 2] = _
            },
            _emscripten_glGetQueryObjectivEXT = _glGetQueryObjectivEXT,
            _glGetQueryObjectui64vEXT = _glGetQueryObjecti64vEXT,
            _emscripten_glGetQueryObjectui64vEXT = _glGetQueryObjectui64vEXT,
            _glGetQueryObjectuivEXT = _glGetQueryObjectivEXT,
            _emscripten_glGetQueryObjectuivEXT = _glGetQueryObjectuivEXT,
            _glGetQueryivEXT = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAP32[n >> 2] = GLctx.disjointTimerQueryExt.getQueryEXT(r, t)
            },
            _emscripten_glGetQueryivEXT = _glGetQueryivEXT,
            _glGetRenderbufferParameteriv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAP32[n >> 2] = GLctx.getRenderbufferParameter(r, t)
            },
            _emscripten_glGetRenderbufferParameteriv = _glGetRenderbufferParameteriv,
            _glGetShaderInfoLog = (r, t, n, e) => {
                var a = GLctx.getShaderInfoLog(GL.shaders[r]);
                a === null && (a = "(unknown error)");
                var _ = t > 0 && e ? stringToUTF8(a, e, t) : 0;
                n && (HEAP32[n >> 2] = _)
            },
            _emscripten_glGetShaderInfoLog = _glGetShaderInfoLog,
            _glGetShaderPrecisionFormat = (r, t, n, e) => {
                var a = GLctx.getShaderPrecisionFormat(r, t);
                HEAP32[n >> 2] = a.rangeMin, HEAP32[n + 4 >> 2] = a.rangeMax, HEAP32[e >> 2] = a.precision
            },
            _emscripten_glGetShaderPrecisionFormat = _glGetShaderPrecisionFormat,
            _glGetShaderSource = (r, t, n, e) => {
                var a = GLctx.getShaderSource(GL.shaders[r]);
                if (a) {
                    var _ = t > 0 && e ? stringToUTF8(a, e, t) : 0;
                    n && (HEAP32[n >> 2] = _)
                }
            },
            _emscripten_glGetShaderSource = _glGetShaderSource,
            _glGetShaderiv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                if (t == 35716) {
                    var e = GLctx.getShaderInfoLog(GL.shaders[r]);
                    e === null && (e = "(unknown error)");
                    var a = e ? e.length + 1 : 0;
                    HEAP32[n >> 2] = a
                } else if (t == 35720) {
                    var _ = GLctx.getShaderSource(GL.shaders[r]),
                        u = _ ? _.length + 1 : 0;
                    HEAP32[n >> 2] = u
                } else HEAP32[n >> 2] = GLctx.getShaderParameter(GL.shaders[r], t)
            },
            _emscripten_glGetShaderiv = _glGetShaderiv,
            stringToNewUTF8 = r => {
                var t = lengthBytesUTF8(r) + 1,
                    n = _malloc(t);
                return n && stringToUTF8(r, n, t), n
            },
            webglGetExtensions = function() {
                var t = getEmscriptenSupportedExtensions(GLctx);
                return t = t.concat(t.map(n => "GL_" + n)), t
            },
            _glGetString = r => {
                var t = GL.stringCache[r];
                if (!t) {
                    switch (r) {
                        case 7939:
                            t = stringToNewUTF8(webglGetExtensions().join(" "));
                            break;
                        case 7936:
                        case 7937:
                        case 37445:
                        case 37446:
                            var n = GLctx.getParameter(r);
                            n || GL.recordError(1280), t = n ? stringToNewUTF8(n) : 0;
                            break;
                        case 7938:
                            var e = GLctx.getParameter(7938);
                            e = `OpenGL ES 2.0 (${e})`, t = stringToNewUTF8(e);
                            break;
                        case 35724:
                            var a = GLctx.getParameter(35724),
                                _ = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/,
                                u = a.match(_);
                            u !== null && (u[1].length == 3 && (u[1] = u[1] + "0"), a = `OpenGL ES GLSL ES ${u[1]} (${a})`), t = stringToNewUTF8(a);
                            break;
                        default:
                            GL.recordError(1280)
                    }
                    GL.stringCache[r] = t
                }
                return t
            },
            _emscripten_glGetString = _glGetString,
            _glGetTexParameterfv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAPF32[n >> 2] = GLctx.getTexParameter(r, t)
            },
            _emscripten_glGetTexParameterfv = _glGetTexParameterfv,
            _glGetTexParameteriv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAP32[n >> 2] = GLctx.getTexParameter(r, t)
            },
            _emscripten_glGetTexParameteriv = _glGetTexParameteriv,
            jstoi_q = r => parseInt(r),
            webglGetLeftBracePos = r => r.slice(-1) == "]" && r.lastIndexOf("["),
            webglPrepareUniformLocationsBeforeFirstUse = r => {
                var t = r.uniformLocsById,
                    n = r.uniformSizeAndIdsByName,
                    e, a;
                if (!t)
                    for (r.uniformLocsById = t = {}, r.uniformArrayNamesById = {}, e = 0; e < GLctx.getProgramParameter(r, 35718); ++e) {
                        var _ = GLctx.getActiveUniform(r, e),
                            u = _.name,
                            c = _.size,
                            m = webglGetLeftBracePos(u),
                            M = m > 0 ? u.slice(0, m) : u,
                            S = r.uniformIdCounter;
                        for (r.uniformIdCounter += c, n[M] = [c, S], a = 0; a < c; ++a) t[S] = a, r.uniformArrayNamesById[S++] = M
                    }
            },
            _glGetUniformLocation = (r, t) => {
                if (t = UTF8ToString(t), r = GL.programs[r]) {
                    webglPrepareUniformLocationsBeforeFirstUse(r);
                    var n = r.uniformLocsById,
                        e = 0,
                        a = t,
                        _ = webglGetLeftBracePos(t);
                    _ > 0 && (e = jstoi_q(t.slice(_ + 1)) >>> 0, a = t.slice(0, _));
                    var u = r.uniformSizeAndIdsByName[a];
                    if (u && e < u[0] && (e += u[1], n[e] = n[e] || GLctx.getUniformLocation(r, t))) return e
                } else GL.recordError(1281);
                return -1
            },
            _emscripten_glGetUniformLocation = _glGetUniformLocation,
            webglGetUniformLocation = r => {
                var t = GLctx.currentProgram;
                if (t) {
                    var n = t.uniformLocsById[r];
                    return typeof n == "number" && (t.uniformLocsById[r] = n = GLctx.getUniformLocation(t, t.uniformArrayNamesById[r] + (n > 0 ? `[${n}]` : ""))), n
                } else GL.recordError(1282)
            },
            emscriptenWebGLGetUniform = (r, t, n, e) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                r = GL.programs[r], webglPrepareUniformLocationsBeforeFirstUse(r);
                var a = GLctx.getUniform(r, webglGetUniformLocation(t));
                if (typeof a == "number" || typeof a == "boolean") switch (e) {
                    case 0:
                        HEAP32[n >> 2] = a;
                        break;
                    case 2:
                        HEAPF32[n >> 2] = a;
                        break
                } else
                    for (var _ = 0; _ < a.length; _++) switch (e) {
                        case 0:
                            HEAP32[n + _ * 4 >> 2] = a[_];
                            break;
                        case 2:
                            HEAPF32[n + _ * 4 >> 2] = a[_];
                            break
                    }
            },
            _glGetUniformfv = (r, t, n) => {
                emscriptenWebGLGetUniform(r, t, n, 2)
            },
            _emscripten_glGetUniformfv = _glGetUniformfv,
            _glGetUniformiv = (r, t, n) => {
                emscriptenWebGLGetUniform(r, t, n, 0)
            },
            _emscripten_glGetUniformiv = _glGetUniformiv,
            _glGetVertexAttribPointerv = (r, t, n) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                HEAP32[n >> 2] = GLctx.getVertexAttribOffset(r, t)
            },
            _emscripten_glGetVertexAttribPointerv = _glGetVertexAttribPointerv,
            emscriptenWebGLGetVertexAttrib = (r, t, n, e) => {
                if (!n) {
                    GL.recordError(1281);
                    return
                }
                var a = GLctx.getVertexAttrib(r, t);
                if (t == 34975) HEAP32[n >> 2] = a && a.name;
                else if (typeof a == "number" || typeof a == "boolean") switch (e) {
                    case 0:
                        HEAP32[n >> 2] = a;
                        break;
                    case 2:
                        HEAPF32[n >> 2] = a;
                        break;
                    case 5:
                        HEAP32[n >> 2] = Math.fround(a);
                        break
                } else
                    for (var _ = 0; _ < a.length; _++) switch (e) {
                        case 0:
                            HEAP32[n + _ * 4 >> 2] = a[_];
                            break;
                        case 2:
                            HEAPF32[n + _ * 4 >> 2] = a[_];
                            break;
                        case 5:
                            HEAP32[n + _ * 4 >> 2] = Math.fround(a[_]);
                            break
                    }
            },
            _glGetVertexAttribfv = (r, t, n) => {
                emscriptenWebGLGetVertexAttrib(r, t, n, 2)
            },
            _emscripten_glGetVertexAttribfv = _glGetVertexAttribfv,
            _glGetVertexAttribiv = (r, t, n) => {
                emscriptenWebGLGetVertexAttrib(r, t, n, 5)
            },
            _emscripten_glGetVertexAttribiv = _glGetVertexAttribiv,
            _glHint = (r, t) => GLctx.hint(r, t),
            _emscripten_glHint = _glHint,
            _glIsBuffer = r => {
                var t = GL.buffers[r];
                return t ? GLctx.isBuffer(t) : 0
            },
            _emscripten_glIsBuffer = _glIsBuffer,
            _glIsEnabled = r => GLctx.isEnabled(r),
            _emscripten_glIsEnabled = _glIsEnabled,
            _glIsFramebuffer = r => {
                var t = GL.framebuffers[r];
                return t ? GLctx.isFramebuffer(t) : 0
            },
            _emscripten_glIsFramebuffer = _glIsFramebuffer,
            _glIsProgram = r => (r = GL.programs[r], r ? GLctx.isProgram(r) : 0),
            _emscripten_glIsProgram = _glIsProgram,
            _glIsQueryEXT = r => {
                var t = GL.queries[r];
                return t ? GLctx.disjointTimerQueryExt.isQueryEXT(t) : 0
            },
            _emscripten_glIsQueryEXT = _glIsQueryEXT,
            _glIsRenderbuffer = r => {
                var t = GL.renderbuffers[r];
                return t ? GLctx.isRenderbuffer(t) : 0
            },
            _emscripten_glIsRenderbuffer = _glIsRenderbuffer,
            _glIsShader = r => {
                var t = GL.shaders[r];
                return t ? GLctx.isShader(t) : 0
            },
            _emscripten_glIsShader = _glIsShader,
            _glIsTexture = r => {
                var t = GL.textures[r];
                return t ? GLctx.isTexture(t) : 0
            },
            _emscripten_glIsTexture = _glIsTexture,
            _glIsVertexArray = r => {
                var t = GL.vaos[r];
                return t ? GLctx.isVertexArray(t) : 0
            },
            _glIsVertexArrayOES = _glIsVertexArray,
            _emscripten_glIsVertexArrayOES = _glIsVertexArrayOES,
            _glLineWidth = r => GLctx.lineWidth(r),
            _emscripten_glLineWidth = _glLineWidth,
            _glLinkProgram = r => {
                r = GL.programs[r], GLctx.linkProgram(r), r.uniformLocsById = 0, r.uniformSizeAndIdsByName = {}
            },
            _emscripten_glLinkProgram = _glLinkProgram,
            _glPixelStorei = (r, t) => {
                r == 3317 && (GL.unpackAlignment = t), GLctx.pixelStorei(r, t)
            },
            _emscripten_glPixelStorei = _glPixelStorei,
            _glPolygonOffset = (r, t) => GLctx.polygonOffset(r, t),
            _emscripten_glPolygonOffset = _glPolygonOffset,
            _glQueryCounterEXT = (r, t) => {
                GLctx.disjointTimerQueryExt.queryCounterEXT(GL.queries[r], t)
            },
            _emscripten_glQueryCounterEXT = _glQueryCounterEXT,
            computeUnpackAlignedImageSize = (r, t, n, e) => {
                function a(c, m) {
                    return c + m - 1 & -m
                }
                var _ = r * n,
                    u = a(_, e);
                return t * u
            },
            colorChannelsInGlTextureFormat = r => {
                var t = {
                    5: 3,
                    6: 4,
                    8: 2,
                    29502: 3,
                    29504: 4
                };
                return t[r - 6402] || 1
            },
            heapObjectForWebGLType = r => (r -= 5120, r == 1 ? HEAPU8 : r == 4 ? HEAP32 : r == 6 ? HEAPF32 : r == 5 || r == 28922 ? HEAPU32 : HEAPU16),
            toTypedArrayIndex = (r, t) => r >>> 31 - Math.clz32(t.BYTES_PER_ELEMENT),
            emscriptenWebGLGetTexPixelData = (r, t, n, e, a, _) => {
                var u = heapObjectForWebGLType(r),
                    c = colorChannelsInGlTextureFormat(t) * u.BYTES_PER_ELEMENT,
                    m = computeUnpackAlignedImageSize(n, e, c, GL.unpackAlignment);
                return u.subarray(toTypedArrayIndex(a, u), toTypedArrayIndex(a + m, u))
            },
            _glReadPixels = (r, t, n, e, a, _, u) => {
                var c = emscriptenWebGLGetTexPixelData(_, a, n, e, u);
                if (!c) {
                    GL.recordError(1280);
                    return
                }
                GLctx.readPixels(r, t, n, e, a, _, c)
            },
            _emscripten_glReadPixels = _glReadPixels,
            _glReleaseShaderCompiler = () => {},
            _emscripten_glReleaseShaderCompiler = _glReleaseShaderCompiler,
            _glRenderbufferStorage = (r, t, n, e) => GLctx.renderbufferStorage(r, t, n, e),
            _emscripten_glRenderbufferStorage = _glRenderbufferStorage,
            _glSampleCoverage = (r, t) => {
                GLctx.sampleCoverage(r, !!t)
            },
            _emscripten_glSampleCoverage = _glSampleCoverage,
            _glScissor = (r, t, n, e) => GLctx.scissor(r, t, n, e),
            _emscripten_glScissor = _glScissor,
            _glShaderBinary = (r, t, n, e, a) => {
                GL.recordError(1280)
            },
            _emscripten_glShaderBinary = _glShaderBinary,
            _glShaderSource = (r, t, n, e) => {
                var a = GL.getSource(r, t, n, e);
                GLctx.shaderSource(GL.shaders[r], a)
            },
            _emscripten_glShaderSource = _glShaderSource,
            _glStencilFunc = (r, t, n) => GLctx.stencilFunc(r, t, n),
            _emscripten_glStencilFunc = _glStencilFunc,
            _glStencilFuncSeparate = (r, t, n, e) => GLctx.stencilFuncSeparate(r, t, n, e),
            _emscripten_glStencilFuncSeparate = _glStencilFuncSeparate,
            _glStencilMask = r => GLctx.stencilMask(r),
            _emscripten_glStencilMask = _glStencilMask,
            _glStencilMaskSeparate = (r, t) => GLctx.stencilMaskSeparate(r, t),
            _emscripten_glStencilMaskSeparate = _glStencilMaskSeparate,
            _glStencilOp = (r, t, n) => GLctx.stencilOp(r, t, n),
            _emscripten_glStencilOp = _glStencilOp,
            _glStencilOpSeparate = (r, t, n, e) => GLctx.stencilOpSeparate(r, t, n, e),
            _emscripten_glStencilOpSeparate = _glStencilOpSeparate,
            _glTexImage2D = (r, t, n, e, a, _, u, c, m) => {
                var M = m ? emscriptenWebGLGetTexPixelData(c, u, e, a, m) : null;
                GLctx.texImage2D(r, t, n, e, a, _, u, c, M)
            },
            _emscripten_glTexImage2D = _glTexImage2D,
            _glTexParameterf = (r, t, n) => GLctx.texParameterf(r, t, n),
            _emscripten_glTexParameterf = _glTexParameterf,
            _glTexParameterfv = (r, t, n) => {
                var e = HEAPF32[n >> 2];
                GLctx.texParameterf(r, t, e)
            },
            _emscripten_glTexParameterfv = _glTexParameterfv,
            _glTexParameteri = (r, t, n) => GLctx.texParameteri(r, t, n),
            _emscripten_glTexParameteri = _glTexParameteri,
            _glTexParameteriv = (r, t, n) => {
                var e = HEAP32[n >> 2];
                GLctx.texParameteri(r, t, e)
            },
            _emscripten_glTexParameteriv = _glTexParameteriv,
            _glTexSubImage2D = (r, t, n, e, a, _, u, c, m) => {
                var M = m ? emscriptenWebGLGetTexPixelData(c, u, a, _, m) : null;
                GLctx.texSubImage2D(r, t, n, e, a, _, u, c, M)
            },
            _emscripten_glTexSubImage2D = _glTexSubImage2D,
            _glUniform1f = (r, t) => {
                GLctx.uniform1f(webglGetUniformLocation(r), t)
            },
            _emscripten_glUniform1f = _glUniform1f,
            miniTempWebGLFloatBuffers = [],
            _glUniform1fv = (r, t, n) => {
                if (t <= 288)
                    for (var e = miniTempWebGLFloatBuffers[t], a = 0; a < t; ++a) e[a] = HEAPF32[n + 4 * a >> 2];
                else var e = HEAPF32.subarray(n >> 2, n + t * 4 >> 2);
                GLctx.uniform1fv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform1fv = _glUniform1fv,
            _glUniform1i = (r, t) => {
                GLctx.uniform1i(webglGetUniformLocation(r), t)
            },
            _emscripten_glUniform1i = _glUniform1i,
            miniTempWebGLIntBuffers = [],
            _glUniform1iv = (r, t, n) => {
                if (t <= 288)
                    for (var e = miniTempWebGLIntBuffers[t], a = 0; a < t; ++a) e[a] = HEAP32[n + 4 * a >> 2];
                else var e = HEAP32.subarray(n >> 2, n + t * 4 >> 2);
                GLctx.uniform1iv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform1iv = _glUniform1iv,
            _glUniform2f = (r, t, n) => {
                GLctx.uniform2f(webglGetUniformLocation(r), t, n)
            },
            _emscripten_glUniform2f = _glUniform2f,
            _glUniform2fv = (r, t, n) => {
                if (t <= 144)
                    for (var e = miniTempWebGLFloatBuffers[2 * t], a = 0; a < 2 * t; a += 2) e[a] = HEAPF32[n + 4 * a >> 2], e[a + 1] = HEAPF32[n + (4 * a + 4) >> 2];
                else var e = HEAPF32.subarray(n >> 2, n + t * 8 >> 2);
                GLctx.uniform2fv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform2fv = _glUniform2fv,
            _glUniform2i = (r, t, n) => {
                GLctx.uniform2i(webglGetUniformLocation(r), t, n)
            },
            _emscripten_glUniform2i = _glUniform2i,
            _glUniform2iv = (r, t, n) => {
                if (t <= 144)
                    for (var e = miniTempWebGLIntBuffers[2 * t], a = 0; a < 2 * t; a += 2) e[a] = HEAP32[n + 4 * a >> 2], e[a + 1] = HEAP32[n + (4 * a + 4) >> 2];
                else var e = HEAP32.subarray(n >> 2, n + t * 8 >> 2);
                GLctx.uniform2iv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform2iv = _glUniform2iv,
            _glUniform3f = (r, t, n, e) => {
                GLctx.uniform3f(webglGetUniformLocation(r), t, n, e)
            },
            _emscripten_glUniform3f = _glUniform3f,
            _glUniform3fv = (r, t, n) => {
                if (t <= 96)
                    for (var e = miniTempWebGLFloatBuffers[3 * t], a = 0; a < 3 * t; a += 3) e[a] = HEAPF32[n + 4 * a >> 2], e[a + 1] = HEAPF32[n + (4 * a + 4) >> 2], e[a + 2] = HEAPF32[n + (4 * a + 8) >> 2];
                else var e = HEAPF32.subarray(n >> 2, n + t * 12 >> 2);
                GLctx.uniform3fv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform3fv = _glUniform3fv,
            _glUniform3i = (r, t, n, e) => {
                GLctx.uniform3i(webglGetUniformLocation(r), t, n, e)
            },
            _emscripten_glUniform3i = _glUniform3i,
            _glUniform3iv = (r, t, n) => {
                if (t <= 96)
                    for (var e = miniTempWebGLIntBuffers[3 * t], a = 0; a < 3 * t; a += 3) e[a] = HEAP32[n + 4 * a >> 2], e[a + 1] = HEAP32[n + (4 * a + 4) >> 2], e[a + 2] = HEAP32[n + (4 * a + 8) >> 2];
                else var e = HEAP32.subarray(n >> 2, n + t * 12 >> 2);
                GLctx.uniform3iv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform3iv = _glUniform3iv,
            _glUniform4f = (r, t, n, e, a) => {
                GLctx.uniform4f(webglGetUniformLocation(r), t, n, e, a)
            },
            _emscripten_glUniform4f = _glUniform4f,
            _glUniform4fv = (r, t, n) => {
                if (t <= 72) {
                    var e = miniTempWebGLFloatBuffers[4 * t],
                        a = HEAPF32;
                    n = n >> 2;
                    for (var _ = 0; _ < 4 * t; _ += 4) {
                        var u = n + _;
                        e[_] = a[u], e[_ + 1] = a[u + 1], e[_ + 2] = a[u + 2], e[_ + 3] = a[u + 3]
                    }
                } else var e = HEAPF32.subarray(n >> 2, n + t * 16 >> 2);
                GLctx.uniform4fv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform4fv = _glUniform4fv,
            _glUniform4i = (r, t, n, e, a) => {
                GLctx.uniform4i(webglGetUniformLocation(r), t, n, e, a)
            },
            _emscripten_glUniform4i = _glUniform4i,
            _glUniform4iv = (r, t, n) => {
                if (t <= 72)
                    for (var e = miniTempWebGLIntBuffers[4 * t], a = 0; a < 4 * t; a += 4) e[a] = HEAP32[n + 4 * a >> 2], e[a + 1] = HEAP32[n + (4 * a + 4) >> 2], e[a + 2] = HEAP32[n + (4 * a + 8) >> 2], e[a + 3] = HEAP32[n + (4 * a + 12) >> 2];
                else var e = HEAP32.subarray(n >> 2, n + t * 16 >> 2);
                GLctx.uniform4iv(webglGetUniformLocation(r), e)
            },
            _emscripten_glUniform4iv = _glUniform4iv,
            _glUniformMatrix2fv = (r, t, n, e) => {
                if (t <= 72)
                    for (var a = miniTempWebGLFloatBuffers[4 * t], _ = 0; _ < 4 * t; _ += 4) a[_] = HEAPF32[e + 4 * _ >> 2], a[_ + 1] = HEAPF32[e + (4 * _ + 4) >> 2], a[_ + 2] = HEAPF32[e + (4 * _ + 8) >> 2], a[_ + 3] = HEAPF32[e + (4 * _ + 12) >> 2];
                else var a = HEAPF32.subarray(e >> 2, e + t * 16 >> 2);
                GLctx.uniformMatrix2fv(webglGetUniformLocation(r), !!n, a)
            },
            _emscripten_glUniformMatrix2fv = _glUniformMatrix2fv,
            _glUniformMatrix3fv = (r, t, n, e) => {
                if (t <= 32)
                    for (var a = miniTempWebGLFloatBuffers[9 * t], _ = 0; _ < 9 * t; _ += 9) a[_] = HEAPF32[e + 4 * _ >> 2], a[_ + 1] = HEAPF32[e + (4 * _ + 4) >> 2], a[_ + 2] = HEAPF32[e + (4 * _ + 8) >> 2], a[_ + 3] = HEAPF32[e + (4 * _ + 12) >> 2], a[_ + 4] = HEAPF32[e + (4 * _ + 16) >> 2], a[_ + 5] = HEAPF32[e + (4 * _ + 20) >> 2], a[_ + 6] = HEAPF32[e + (4 * _ + 24) >> 2], a[_ + 7] = HEAPF32[e + (4 * _ + 28) >> 2], a[_ + 8] = HEAPF32[e + (4 * _ + 32) >> 2];
                else var a = HEAPF32.subarray(e >> 2, e + t * 36 >> 2);
                GLctx.uniformMatrix3fv(webglGetUniformLocation(r), !!n, a)
            },
            _emscripten_glUniformMatrix3fv = _glUniformMatrix3fv,
            _glUniformMatrix4fv = (r, t, n, e) => {
                if (t <= 18) {
                    var a = miniTempWebGLFloatBuffers[16 * t],
                        _ = HEAPF32;
                    e = e >> 2;
                    for (var u = 0; u < 16 * t; u += 16) {
                        var c = e + u;
                        a[u] = _[c], a[u + 1] = _[c + 1], a[u + 2] = _[c + 2], a[u + 3] = _[c + 3], a[u + 4] = _[c + 4], a[u + 5] = _[c + 5], a[u + 6] = _[c + 6], a[u + 7] = _[c + 7], a[u + 8] = _[c + 8], a[u + 9] = _[c + 9], a[u + 10] = _[c + 10], a[u + 11] = _[c + 11], a[u + 12] = _[c + 12], a[u + 13] = _[c + 13], a[u + 14] = _[c + 14], a[u + 15] = _[c + 15]
                    }
                } else var a = HEAPF32.subarray(e >> 2, e + t * 64 >> 2);
                GLctx.uniformMatrix4fv(webglGetUniformLocation(r), !!n, a)
            },
            _emscripten_glUniformMatrix4fv = _glUniformMatrix4fv,
            _glUseProgram = r => {
                r = GL.programs[r], GLctx.useProgram(r), GLctx.currentProgram = r
            },
            _emscripten_glUseProgram = _glUseProgram,
            _glValidateProgram = r => {
                GLctx.validateProgram(GL.programs[r])
            },
            _emscripten_glValidateProgram = _glValidateProgram,
            _glVertexAttrib1f = (r, t) => GLctx.vertexAttrib1f(r, t),
            _emscripten_glVertexAttrib1f = _glVertexAttrib1f,
            _glVertexAttrib1fv = (r, t) => {
                GLctx.vertexAttrib1f(r, HEAPF32[t >> 2])
            },
            _emscripten_glVertexAttrib1fv = _glVertexAttrib1fv,
            _glVertexAttrib2f = (r, t, n) => GLctx.vertexAttrib2f(r, t, n),
            _emscripten_glVertexAttrib2f = _glVertexAttrib2f,
            _glVertexAttrib2fv = (r, t) => {
                GLctx.vertexAttrib2f(r, HEAPF32[t >> 2], HEAPF32[t + 4 >> 2])
            },
            _emscripten_glVertexAttrib2fv = _glVertexAttrib2fv,
            _glVertexAttrib3f = (r, t, n, e) => GLctx.vertexAttrib3f(r, t, n, e),
            _emscripten_glVertexAttrib3f = _glVertexAttrib3f,
            _glVertexAttrib3fv = (r, t) => {
                GLctx.vertexAttrib3f(r, HEAPF32[t >> 2], HEAPF32[t + 4 >> 2], HEAPF32[t + 8 >> 2])
            },
            _emscripten_glVertexAttrib3fv = _glVertexAttrib3fv,
            _glVertexAttrib4f = (r, t, n, e, a) => GLctx.vertexAttrib4f(r, t, n, e, a),
            _emscripten_glVertexAttrib4f = _glVertexAttrib4f,
            _glVertexAttrib4fv = (r, t) => {
                GLctx.vertexAttrib4f(r, HEAPF32[t >> 2], HEAPF32[t + 4 >> 2], HEAPF32[t + 8 >> 2], HEAPF32[t + 12 >> 2])
            },
            _emscripten_glVertexAttrib4fv = _glVertexAttrib4fv,
            _glVertexAttribDivisor = (r, t) => {
                GLctx.vertexAttribDivisor(r, t)
            },
            _glVertexAttribDivisorANGLE = _glVertexAttribDivisor,
            _emscripten_glVertexAttribDivisorANGLE = _glVertexAttribDivisorANGLE,
            _glVertexAttribPointer = (r, t, n, e, a, _) => {
                GLctx.vertexAttribPointer(r, t, n, !!e, a, _)
            },
            _emscripten_glVertexAttribPointer = _glVertexAttribPointer,
            _glViewport = (r, t, n, e) => GLctx.viewport(r, t, n, e),
            _emscripten_glViewport = _glViewport,
            _emscripten_request_pointerlock = (r, t) => {
                if (r = findEventTarget(r), !r) return -4;
                if (!r.requestPointerLock) return -1;
                var n = JSEvents.canPerformEventHandlerRequests();
                return n ? requestPointerLock(r) : t ? (JSEvents.deferCall(requestPointerLock, 2, [r]), 1) : -2
            },
            getHeapMax = () => 2147483648,
            growMemory = r => {
                var t = wasmMemory.buffer,
                    n = (r - t.byteLength + 65535) / 65536;
                try {
                    return wasmMemory.grow(n), updateMemoryViews(), 1
                } catch {}
            },
            _emscripten_resize_heap = r => {
                var t = HEAPU8.length;
                r >>>= 0;
                var n = getHeapMax();
                if (r > n) return !1;
                for (var e = (m, M) => m + (M - m % M) % M, a = 1; a <= 4; a *= 2) {
                    var _ = t * (1 + .2 / a);
                    _ = Math.min(_, r + 100663296);
                    var u = Math.min(n, e(Math.max(r, _), 65536)),
                        c = growMemory(u);
                    if (c) return !0
                }
                return !1
            },
            _emscripten_run_script = ptr => {
                eval(UTF8ToString(ptr))
            },
            _emscripten_sample_gamepad_data = () => {
                try {
                    if (navigator.getGamepads) return (JSEvents.lastGamepadState = navigator.getGamepads()) ? 0 : -1
                } catch {
                    navigator.getGamepads = null
                }
                return -1
            },
            findCanvasEventTarget = findEventTarget,
            _emscripten_set_canvas_element_size = (r, t, n) => {
                var e = findCanvasEventTarget(r);
                return e ? (e.width = t, e.height = n, 0) : -4
            },
            fillMouseEventData = (r, t, n) => {
                HEAPF64[r >> 3] = t.timeStamp;
                var e = r >> 2;
                HEAP32[e + 2] = t.screenX, HEAP32[e + 3] = t.screenY, HEAP32[e + 4] = t.clientX, HEAP32[e + 5] = t.clientY, HEAP32[e + 6] = t.ctrlKey, HEAP32[e + 7] = t.shiftKey, HEAP32[e + 8] = t.altKey, HEAP32[e + 9] = t.metaKey, HEAP16[e * 2 + 20] = t.button, HEAP16[e * 2 + 21] = t.buttons, HEAP32[e + 11] = t.movementX, HEAP32[e + 12] = t.movementY;
                var a = getBoundingClientRect(n);
                HEAP32[e + 13] = t.clientX - (a.left | 0), HEAP32[e + 14] = t.clientY - (a.top | 0)
            },
            wasmTable, getWasmTableEntry = r => wasmTable.get(r),
            registerMouseEventCallback = (r, t, n, e, a, _, u) => {
                JSEvents.mouseEvent || (JSEvents.mouseEvent = _malloc(72)), r = findEventTarget(r);
                var c = (M = event) => {
                        fillMouseEventData(JSEvents.mouseEvent, M, r), getWasmTableEntry(e)(a, JSEvents.mouseEvent, t) && M.preventDefault()
                    },
                    m = {
                        target: r,
                        allowsDeferredCalls: _ != "mouseleave",
                        eventTypeString: _,
                        callbackfunc: e,
                        handlerFunc: c,
                        useCapture: n
                    };
                return JSEvents.registerOrRemoveHandler(m)
            },
            _emscripten_set_click_callback_on_thread = (r, t, n, e, a) => registerMouseEventCallback(r, t, n, e, 4, "click"),
            fillFullscreenChangeEventData = r => {
                var t = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement,
                    n = !!t;
                HEAP32[r >> 2] = n, HEAP32[r + 4 >> 2] = JSEvents.fullscreenEnabled();
                var e = n ? t : JSEvents.previousFullscreenElement,
                    a = JSEvents.getNodeNameForTarget(e),
                    _ = (e == null ? void 0 : e.id) || "";
                stringToUTF8(a, r + 8, 128), stringToUTF8(_, r + 136, 128), HEAP32[r + 264 >> 2] = e ? e.clientWidth : 0, HEAP32[r + 268 >> 2] = e ? e.clientHeight : 0, HEAP32[r + 272 >> 2] = screen.width, HEAP32[r + 276 >> 2] = screen.height, n && (JSEvents.previousFullscreenElement = t)
            },
            registerFullscreenChangeEventCallback = (r, t, n, e, a, _, u) => {
                JSEvents.fullscreenChangeEvent || (JSEvents.fullscreenChangeEvent = _malloc(280));
                var c = (M = event) => {
                        var S = JSEvents.fullscreenChangeEvent;
                        fillFullscreenChangeEventData(S), getWasmTableEntry(e)(a, S, t) && M.preventDefault()
                    },
                    m = {
                        target: r,
                        eventTypeString: _,
                        callbackfunc: e,
                        handlerFunc: c,
                        useCapture: n
                    };
                return JSEvents.registerOrRemoveHandler(m)
            },
            _emscripten_set_fullscreenchange_callback_on_thread = (r, t, n, e, a) => JSEvents.fullscreenEnabled() ? (r = findEventTarget(r), r ? (registerFullscreenChangeEventCallback(r, t, n, e, 19, "webkitfullscreenchange"), registerFullscreenChangeEventCallback(r, t, n, e, 19, "fullscreenchange")) : -4) : -1,
            registerGamepadEventCallback = (r, t, n, e, a, _, u) => {
                JSEvents.gamepadEvent || (JSEvents.gamepadEvent = _malloc(1432));
                var c = (M = event) => {
                        var S = JSEvents.gamepadEvent;
                        fillGamepadEventData(S, M.gamepad), getWasmTableEntry(e)(a, S, t) && M.preventDefault()
                    },
                    m = {
                        target: findEventTarget(r),
                        allowsDeferredCalls: !0,
                        eventTypeString: _,
                        callbackfunc: e,
                        handlerFunc: c,
                        useCapture: n
                    };
                return JSEvents.registerOrRemoveHandler(m)
            },
            _emscripten_set_gamepadconnected_callback_on_thread = (r, t, n, e) => _emscripten_sample_gamepad_data() ? -1 : registerGamepadEventCallback(2, r, t, n, 26, "gamepadconnected"),
            _emscripten_set_gamepaddisconnected_callback_on_thread = (r, t, n, e) => _emscripten_sample_gamepad_data() ? -1 : registerGamepadEventCallback(2, r, t, n, 27, "gamepaddisconnected"),
            registerUiEventCallback = (r, t, n, e, a, _, u) => {
                JSEvents.uiEvent || (JSEvents.uiEvent = _malloc(36)), r = findEventTarget(r);
                var c = (M = event) => {
                        if (M.target == r) {
                            var S = document.body;
                            if (S) {
                                var L = JSEvents.uiEvent;
                                HEAP32[L >> 2] = 0, HEAP32[L + 4 >> 2] = S.clientWidth, HEAP32[L + 8 >> 2] = S.clientHeight, HEAP32[L + 12 >> 2] = innerWidth, HEAP32[L + 16 >> 2] = innerHeight, HEAP32[L + 20 >> 2] = outerWidth, HEAP32[L + 24 >> 2] = outerHeight, HEAP32[L + 28 >> 2] = pageXOffset | 0, HEAP32[L + 32 >> 2] = pageYOffset | 0, getWasmTableEntry(e)(a, L, t) && M.preventDefault()
                            }
                        }
                    },
                    m = {
                        target: r,
                        eventTypeString: _,
                        callbackfunc: e,
                        handlerFunc: c,
                        useCapture: n
                    };
                return JSEvents.registerOrRemoveHandler(m)
            },
            _emscripten_set_resize_callback_on_thread = (r, t, n, e, a) => registerUiEventCallback(r, t, n, e, 10, "resize"),
            registerTouchEventCallback = (r, t, n, e, a, _, u) => {
                JSEvents.touchEvent || (JSEvents.touchEvent = _malloc(1696)), r = findEventTarget(r);
                var c = M => {
                        for (var S, L = {}, R = M.touches, C = 0; C < R.length; ++C) S = R[C], S.isChanged = S.onTarget = 0, L[S.identifier] = S;
                        for (var C = 0; C < M.changedTouches.length; ++C) S = M.changedTouches[C], S.isChanged = 1, L[S.identifier] = S;
                        for (var C = 0; C < M.targetTouches.length; ++C) L[M.targetTouches[C].identifier].onTarget = 1;
                        var I = JSEvents.touchEvent;
                        HEAPF64[I >> 3] = M.timeStamp;
                        var T = I >> 2;
                        HEAP32[T + 3] = M.ctrlKey, HEAP32[T + 4] = M.shiftKey, HEAP32[T + 5] = M.altKey, HEAP32[T + 6] = M.metaKey, T += 7;
                        var w = getBoundingClientRect(r),
                            A = 0;
                        for (var C in L)
                            if (S = L[C], HEAP32[T + 0] = S.identifier, HEAP32[T + 1] = S.screenX, HEAP32[T + 2] = S.screenY, HEAP32[T + 3] = S.clientX, HEAP32[T + 4] = S.clientY, HEAP32[T + 5] = S.pageX, HEAP32[T + 6] = S.pageY, HEAP32[T + 7] = S.isChanged, HEAP32[T + 8] = S.onTarget, HEAP32[T + 9] = S.clientX - (w.left | 0), HEAP32[T + 10] = S.clientY - (w.top | 0), T += 13, ++A > 31) break;
                        HEAP32[I + 8 >> 2] = A, getWasmTableEntry(e)(a, I, t) && M.preventDefault()
                    },
                    m = {
                        target: r,
                        allowsDeferredCalls: _ == "touchstart" || _ == "touchend",
                        eventTypeString: _,
                        callbackfunc: e,
                        handlerFunc: c,
                        useCapture: n
                    };
                return JSEvents.registerOrRemoveHandler(m)
            },
            _emscripten_set_touchcancel_callback_on_thread = (r, t, n, e, a) => registerTouchEventCallback(r, t, n, e, 25, "touchcancel"),
            _emscripten_set_touchend_callback_on_thread = (r, t, n, e, a) => registerTouchEventCallback(r, t, n, e, 23, "touchend"),
            _emscripten_set_touchmove_callback_on_thread = (r, t, n, e, a) => registerTouchEventCallback(r, t, n, e, 24, "touchmove"),
            _emscripten_set_touchstart_callback_on_thread = (r, t, n, e, a) => registerTouchEventCallback(r, t, n, e, 22, "touchstart"),
            _emscripten_set_main_loop_timing = (r, t) => {
                if (Browser.mainLoop.timingMode = r, Browser.mainLoop.timingValue = t, !Browser.mainLoop.func) return 1;
                if (Browser.mainLoop.running || (Browser.mainLoop.running = !0), r == 0) Browser.mainLoop.scheduler = function() {
                    var u = Math.max(0, Browser.mainLoop.tickStartTime + t - _emscripten_get_now()) | 0;
                    setTimeout(Browser.mainLoop.runner, u)
                }, Browser.mainLoop.method = "timeout";
                else if (r == 1) Browser.mainLoop.scheduler = function() {
                    Browser.requestAnimationFrame(Browser.mainLoop.runner)
                }, Browser.mainLoop.method = "rAF";
                else if (r == 2) {
                    if (typeof Browser.setImmediate > "u")
                        if (typeof setImmediate > "u") {
                            var n = [],
                                e = "setimmediate",
                                a = _ => {
                                    (_.data === e || _.data.target === e) && (_.stopPropagation(), n.shift()())
                                };
                            addEventListener("message", a, !0), Browser.setImmediate = function(u) {
                                n.push(u), postMessage(e, "*")
                            }
                        } else Browser.setImmediate = setImmediate;
                    Browser.mainLoop.scheduler = function() {
                        Browser.setImmediate(Browser.mainLoop.runner)
                    }, Browser.mainLoop.method = "immediate"
                }
                return 0
            },
            setMainLoop = (r, t, n, e, a) => {
                Browser.mainLoop.func = r, Browser.mainLoop.arg = e;
                var _ = Browser.mainLoop.currentlyRunningMainloop;

                function u() {
                    return !(_ < Browser.mainLoop.currentlyRunningMainloop)
                }
                Browser.mainLoop.running = !1, Browser.mainLoop.runner = function() {
                    var L, R;
                    if (!ABORT) {
                        if (Browser.mainLoop.queue.length > 0) {
                            var m = Browser.mainLoop.queue.shift();
                            if (m.func(m.arg), Browser.mainLoop.remainingBlockers) {
                                var M = Browser.mainLoop.remainingBlockers,
                                    S = M % 1 == 0 ? M - 1 : Math.floor(M);
                                m.counted ? Browser.mainLoop.remainingBlockers = S : (S = S + .5, Browser.mainLoop.remainingBlockers = (8 * M + S) / 9)
                            }
                            if (Browser.mainLoop.updateStatus(), !u()) return;
                            setTimeout(Browser.mainLoop.runner, 0);
                            return
                        }
                        if (u()) {
                            if (Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0, Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
                                Browser.mainLoop.scheduler();
                                return
                            } else Browser.mainLoop.timingMode == 0 && (Browser.mainLoop.tickStartTime = _emscripten_get_now());
                            Browser.mainLoop.runIter(r), u() && (typeof SDL == "object" && ((R = (L = SDL.audio) == null ? void 0 : L.queueNewAudioData) == null || R.call(L)), Browser.mainLoop.scheduler())
                        }
                    }
                }
            },
            handleException = r => {
                if (r instanceof ExitStatus || r == "unwind") return EXITSTATUS;
                quit_(1, r)
            },
            runtimeKeepaliveCounter = 0,
            keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0,
            _proc_exit = r => {
                var t;
                EXITSTATUS = r, keepRuntimeAlive() || ((t = Module.onExit) == null || t.call(Module, r), ABORT = !0), quit_(r, new ExitStatus(r))
            },
            exitJS = (r, t) => {
                EXITSTATUS = r, _proc_exit(r)
            },
            _exit = exitJS,
            maybeExit = () => {
                if (!keepRuntimeAlive()) try {
                    _exit(EXITSTATUS)
                } catch (r) {
                    handleException(r)
                }
            },
            callUserCallback = r => {
                if (!ABORT) try {
                    r(), maybeExit()
                } catch (t) {
                    handleException(t)
                }
            },
            safeSetTimeout = (r, t) => setTimeout(() => {
                callUserCallback(r)
            }, t),
            Browser = {
                mainLoop: {
                    running: !1,
                    scheduler: null,
                    method: "",
                    currentlyRunningMainloop: 0,
                    func: null,
                    arg: 0,
                    timingMode: 0,
                    timingValue: 0,
                    currentFrameNumber: 0,
                    queue: [],
                    pause() {
                        Browser.mainLoop.scheduler = null, Browser.mainLoop.currentlyRunningMainloop++
                    },
                    resume() {
                        Browser.mainLoop.currentlyRunningMainloop++;
                        var r = Browser.mainLoop.timingMode,
                            t = Browser.mainLoop.timingValue,
                            n = Browser.mainLoop.func;
                        Browser.mainLoop.func = null, setMainLoop(n, 0, !1, Browser.mainLoop.arg), _emscripten_set_main_loop_timing(r, t), Browser.mainLoop.scheduler()
                    },
                    updateStatus() {
                        if (Module.setStatus) {
                            var r = Module.statusMessage || "Please wait...",
                                t = Browser.mainLoop.remainingBlockers,
                                n = Browser.mainLoop.expectedBlockers;
                            t ? t < n ? Module.setStatus("{message} ({expected - remaining}/{expected})") : Module.setStatus(r) : Module.setStatus("")
                        }
                    },
                    runIter(r) {
                        var n;
                        if (!ABORT) {
                            if (Module.preMainLoop) {
                                var t = Module.preMainLoop();
                                if (t === !1) return
                            }
                            callUserCallback(r), (n = Module.postMainLoop) == null || n.call(Module)
                        }
                    }
                },
                isFullscreen: !1,
                pointerLock: !1,
                moduleContextCreatedCallbacks: [],
                workers: [],
                init() {
                    if (Browser.initted) return;
                    Browser.initted = !0;
                    var r = {};
                    r.canHandle = function(_) {
                        return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(_)
                    }, r.handle = function(_, u, c, m) {
                        var M = new Blob([_], {
                            type: Browser.getMimetype(u)
                        });
                        M.size !== _.length && (M = new Blob([new Uint8Array(_).buffer], {
                            type: Browser.getMimetype(u)
                        }));
                        var S = URL.createObjectURL(M),
                            L = new Image;
                        L.onload = () => {
                            var R = document.createElement("canvas");
                            R.width = L.width, R.height = L.height;
                            var C = R.getContext("2d");
                            C.drawImage(L, 0, 0), URL.revokeObjectURL(S), c == null || c(_)
                        }, L.onerror = R => {
                            err(`Image ${S} could not be decoded`), m == null || m()
                        }, L.src = S
                    }, preloadPlugins.push(r);
                    var t = {};
                    t.canHandle = function(_) {
                        return !Module.noAudioDecoding && _.substr(-4) in {
                            ".ogg": 1,
                            ".wav": 1,
                            ".mp3": 1
                        }
                    }, t.handle = function(_, u, c, m) {
                        var M = !1;

                        function S(I) {
                            M || (M = !0, c == null || c(_))
                        }
                        var L = new Blob([_], {
                                type: Browser.getMimetype(u)
                            }),
                            R = URL.createObjectURL(L),
                            C = new Audio;
                        C.addEventListener("canplaythrough", () => S(), !1), C.onerror = function(T) {
                            if (M) return;
                            err(`warning: browser could not fully decode audio ${u}, trying slower base64 approach`);

                            function w(A) {
                                for (var h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", G = "=", O = "", D = 0, f = 0, g = 0; g < A.length; g++)
                                    for (D = D << 8 | A[g], f += 8; f >= 6;) {
                                        var y = D >> f - 6 & 63;
                                        f -= 6, O += h[y]
                                    }
                                return f == 2 ? (O += h[(D & 3) << 4], O += G + G) : f == 4 && (O += h[(D & 15) << 2], O += G), O
                            }
                            C.src = "data:audio/x-" + u.substr(-3) + ";base64," + w(_), S()
                        }, C.src = R, safeSetTimeout(() => {
                            S()
                        }, 1e4)
                    }, preloadPlugins.push(t);

                    function n() {
                        Browser.pointerLock = document.pointerLockElement === Module.canvas || document.mozPointerLockElement === Module.canvas || document.webkitPointerLockElement === Module.canvas || document.msPointerLockElement === Module.canvas
                    }
                    var e = Module.canvas;
                    e && (e.requestPointerLock = e.requestPointerLock || e.mozRequestPointerLock || e.webkitRequestPointerLock || e.msRequestPointerLock || (() => {}), e.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock || document.msExitPointerLock || (() => {}), e.exitPointerLock = e.exitPointerLock.bind(document), document.addEventListener("pointerlockchange", n, !1), document.addEventListener("mozpointerlockchange", n, !1), document.addEventListener("webkitpointerlockchange", n, !1), document.addEventListener("mspointerlockchange", n, !1), Module.elementPointerLock && e.addEventListener("click", a => {
                        !Browser.pointerLock && Module.canvas.requestPointerLock && (Module.canvas.requestPointerLock(), a.preventDefault())
                    }, !1))
                },
                createContext(r, t, n, e) {
                    if (t && Module.ctx && r == Module.canvas) return Module.ctx;
                    var a, _;
                    if (t) {
                        var u = {
                            antialias: !1,
                            alpha: !1,
                            majorVersion: 1
                        };
                        if (e)
                            for (var c in e) u[c] = e[c];
                        typeof GL < "u" && (_ = GL.createContext(r, u), _ && (a = GL.getContext(_).GLctx))
                    } else a = r.getContext("2d");
                    return a ? (n && (Module.ctx = a, t && GL.makeContextCurrent(_), Module.useWebGL = t, Browser.moduleContextCreatedCallbacks.forEach(m => m()), Browser.init()), a) : null
                },
                destroyContext(r, t, n) {},
                fullscreenHandlersInstalled: !1,
                lockPointer: void 0,
                resizeCanvas: void 0,
                requestFullscreen(r, t) {
                    Browser.lockPointer = r, Browser.resizeCanvas = t, typeof Browser.lockPointer > "u" && (Browser.lockPointer = !0), typeof Browser.resizeCanvas > "u" && (Browser.resizeCanvas = !1);
                    var n = Module.canvas;

                    function e() {
                        var u, c;
                        Browser.isFullscreen = !1;
                        var _ = n.parentNode;
                        (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === _ ? (n.exitFullscreen = Browser.exitFullscreen, Browser.lockPointer && n.requestPointerLock(), Browser.isFullscreen = !0, Browser.resizeCanvas ? Browser.setFullscreenCanvasSize() : Browser.updateCanvasDimensions(n)) : (_.parentNode.insertBefore(n, _), _.parentNode.removeChild(_), Browser.resizeCanvas ? Browser.setWindowedCanvasSize() : Browser.updateCanvasDimensions(n)), (u = Module.onFullScreen) == null || u.call(Module, Browser.isFullscreen), (c = Module.onFullscreen) == null || c.call(Module, Browser.isFullscreen)
                    }
                    Browser.fullscreenHandlersInstalled || (Browser.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", e, !1), document.addEventListener("mozfullscreenchange", e, !1), document.addEventListener("webkitfullscreenchange", e, !1), document.addEventListener("MSFullscreenChange", e, !1));
                    var a = document.createElement("div");
                    n.parentNode.insertBefore(a, n), a.appendChild(n), a.requestFullscreen = a.requestFullscreen || a.mozRequestFullScreen || a.msRequestFullscreen || (a.webkitRequestFullscreen ? () => a.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) : null) || (a.webkitRequestFullScreen ? () => a.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : null), a.requestFullscreen()
                },
                exitFullscreen() {
                    if (!Browser.isFullscreen) return !1;
                    var r = document.exitFullscreen || document.cancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitCancelFullScreen || (() => {});
                    return r.apply(document, []), !0
                },
                nextRAF: 0,
                fakeRequestAnimationFrame(r) {
                    var t = Date.now();
                    if (Browser.nextRAF === 0) Browser.nextRAF = t + 1e3 / 60;
                    else
                        for (; t + 2 >= Browser.nextRAF;) Browser.nextRAF += 1e3 / 60;
                    var n = Math.max(Browser.nextRAF - t, 0);
                    setTimeout(r, n)
                },
                requestAnimationFrame(r) {
                    if (typeof requestAnimationFrame == "function") {
                        requestAnimationFrame(r);
                        return
                    }
                    var t = Browser.fakeRequestAnimationFrame;
                    t(r)
                },
                safeSetTimeout(r, t) {
                    return safeSetTimeout(r, t)
                },
                safeRequestAnimationFrame(r) {
                    return Browser.requestAnimationFrame(() => {
                        callUserCallback(r)
                    })
                },
                getMimetype(r) {
                    return {
                        jpg: "image/jpeg",
                        jpeg: "image/jpeg",
                        png: "image/png",
                        bmp: "image/bmp",
                        ogg: "audio/ogg",
                        wav: "audio/wav",
                        mp3: "audio/mpeg"
                    } [r.substr(r.lastIndexOf(".") + 1)]
                },
                getUserMedia(r) {
                    window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia), window.getUserMedia(r)
                },
                getMovementX(r) {
                    return r.movementX || r.mozMovementX || r.webkitMovementX || 0
                },
                getMovementY(r) {
                    return r.movementY || r.mozMovementY || r.webkitMovementY || 0
                },
                getMouseWheelDelta(r) {
                    var t = 0;
                    switch (r.type) {
                        case "DOMMouseScroll":
                            t = r.detail / 3;
                            break;
                        case "mousewheel":
                            t = r.wheelDelta / 120;
                            break;
                        case "wheel":
                            switch (t = r.deltaY, r.deltaMode) {
                                case 0:
                                    t /= 100;
                                    break;
                                case 1:
                                    t /= 3;
                                    break;
                                case 2:
                                    t *= 80;
                                    break;
                                default:
                                    throw "unrecognized mouse wheel delta mode: " + r.deltaMode
                            }
                            break;
                        default:
                            throw "unrecognized mouse wheel event: " + r.type
                    }
                    return t
                },
                mouseX: 0,
                mouseY: 0,
                mouseMovementX: 0,
                mouseMovementY: 0,
                touches: {},
                lastTouches: {},
                calculateMouseCoords(r, t) {
                    var n = Module.canvas.getBoundingClientRect(),
                        e = Module.canvas.width,
                        a = Module.canvas.height,
                        _ = typeof window.scrollX < "u" ? window.scrollX : window.pageXOffset,
                        u = typeof window.scrollY < "u" ? window.scrollY : window.pageYOffset,
                        c = r - (_ + n.left),
                        m = t - (u + n.top);
                    return c = c * (e / n.width), m = m * (a / n.height), {
                        x: c,
                        y: m
                    }
                },
                setMouseCoords(r, t) {
                    const {
                        x: n,
                        y: e
                    } = Browser.calculateMouseCoords(r, t);
                    Browser.mouseMovementX = n - Browser.mouseX, Browser.mouseMovementY = e - Browser.mouseY, Browser.mouseX = n, Browser.mouseY = e
                },
                calculateMouseEvent(r) {
                    if (Browser.pointerLock) r.type != "mousemove" && "mozMovementX" in r ? Browser.mouseMovementX = Browser.mouseMovementY = 0 : (Browser.mouseMovementX = Browser.getMovementX(r), Browser.mouseMovementY = Browser.getMovementY(r)), Browser.mouseX += Browser.mouseMovementX, Browser.mouseY += Browser.mouseMovementY;
                    else {
                        if (r.type === "touchstart" || r.type === "touchend" || r.type === "touchmove") {
                            var t = r.touch;
                            if (t === void 0) return;
                            var n = Browser.calculateMouseCoords(t.pageX, t.pageY);
                            if (r.type === "touchstart") Browser.lastTouches[t.identifier] = n, Browser.touches[t.identifier] = n;
                            else if (r.type === "touchend" || r.type === "touchmove") {
                                var e = Browser.touches[t.identifier];
                                e || (e = n), Browser.lastTouches[t.identifier] = e, Browser.touches[t.identifier] = n
                            }
                            return
                        }
                        Browser.setMouseCoords(r.pageX, r.pageY)
                    }
                },
                resizeListeners: [],
                updateResizeListeners() {
                    var r = Module.canvas;
                    Browser.resizeListeners.forEach(t => t(r.width, r.height))
                },
                setCanvasSize(r, t, n) {
                    var e = Module.canvas;
                    Browser.updateCanvasDimensions(e, r, t), n || Browser.updateResizeListeners()
                },
                windowedWidth: 0,
                windowedHeight: 0,
                setFullscreenCanvasSize() {
                    if (typeof SDL < "u") {
                        var r = HEAPU32[SDL.screen >> 2];
                        r = r | 8388608, HEAP32[SDL.screen >> 2] = r
                    }
                    Browser.updateCanvasDimensions(Module.canvas), Browser.updateResizeListeners()
                },
                setWindowedCanvasSize() {
                    if (typeof SDL < "u") {
                        var r = HEAPU32[SDL.screen >> 2];
                        r = r & -8388609, HEAP32[SDL.screen >> 2] = r
                    }
                    Browser.updateCanvasDimensions(Module.canvas), Browser.updateResizeListeners()
                },
                updateCanvasDimensions(r, t, n) {
                    t && n ? (r.widthNative = t, r.heightNative = n) : (t = r.widthNative, n = r.heightNative);
                    var e = t,
                        a = n;
                    if (Module.forcedAspectRatio && Module.forcedAspectRatio > 0 && (e / a < Module.forcedAspectRatio ? e = Math.round(a * Module.forcedAspectRatio) : a = Math.round(e / Module.forcedAspectRatio)), (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === r.parentNode && typeof screen < "u") {
                        var _ = Math.min(screen.width / e, screen.height / a);
                        e = Math.round(e * _), a = Math.round(a * _)
                    }
                    Browser.resizeCanvas ? (r.width != e && (r.width = e), r.height != a && (r.height = a), typeof r.style < "u" && (r.style.removeProperty("width"), r.style.removeProperty("height"))) : (r.width != t && (r.width = t), r.height != n && (r.height = n), typeof r.style < "u" && (e != t || a != n ? (r.style.setProperty("width", e + "px", "important"), r.style.setProperty("height", a + "px", "important")) : (r.style.removeProperty("width"), r.style.removeProperty("height"))))
                }
            },
            _emscripten_set_window_title = r => document.title = UTF8ToString(r),
            _emscripten_sleep = () => {
                throw "Please compile your program with async support in order to use asynchronous operations like emscripten_sleep"
            };

        function _fd_close(r) {
            try {
                var t = SYSCALLS.getStreamFromFD(r);
                return FS.close(t), 0
            } catch (n) {
                if (typeof FS > "u" || n.name !== "ErrnoError") throw n;
                return n.errno
            }
        }
        var doReadv = (r, t, n, e) => {
            for (var a = 0, _ = 0; _ < n; _++) {
                var u = HEAPU32[t >> 2],
                    c = HEAPU32[t + 4 >> 2];
                t += 8;
                var m = FS.read(r, HEAP8, u, c, e);
                if (m < 0) return -1;
                if (a += m, m < c) break
            }
            return a
        };

        function _fd_read(r, t, n, e) {
            try {
                var a = SYSCALLS.getStreamFromFD(r),
                    _ = doReadv(a, t, n);
                return HEAPU32[e >> 2] = _, 0
            } catch (u) {
                if (typeof FS > "u" || u.name !== "ErrnoError") throw u;
                return u.errno
            }
        }
        var convertI32PairToI53Checked = (r, t) => t + 2097152 >>> 0 < 4194305 - !!r ? (r >>> 0) + t * 4294967296 : NaN;

        function _fd_seek(r, t, n, e, a) {
            var _ = convertI32PairToI53Checked(t, n);
            try {
                if (isNaN(_)) return 61;
                var u = SYSCALLS.getStreamFromFD(r);
                return FS.llseek(u, _, e), tempI64 = [u.position >>> 0, (tempDouble = u.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[a >> 2] = tempI64[0], HEAP32[a + 4 >> 2] = tempI64[1], u.getdents && _ === 0 && e === 0 && (u.getdents = null), 0
            } catch (c) {
                if (typeof FS > "u" || c.name !== "ErrnoError") throw c;
                return c.errno
            }
        }
        var doWritev = (r, t, n, e) => {
            for (var a = 0, _ = 0; _ < n; _++) {
                var u = HEAPU32[t >> 2],
                    c = HEAPU32[t + 4 >> 2];
                t += 8;
                var m = FS.write(r, HEAP8, u, c, e);
                if (m < 0) return -1;
                a += m
            }
            return a
        };

        function _fd_write(r, t, n, e) {
            try {
                var a = SYSCALLS.getStreamFromFD(r),
                    _ = doWritev(a, t, n);
                return HEAPU32[e >> 2] = _, 0
            } catch (u) {
                if (typeof FS > "u" || u.name !== "ErrnoError") throw u;
                return u.errno
            }
        }

        function GLFW_Window(r, t, n, e, a, _, u, c) {
            this.id = r, this.x = 0, this.y = 0, this.fullscreen = !1, this.storedX = 0, this.storedY = 0, this.width = t, this.height = n, this.framebufferWidth = e, this.framebufferHeight = a, this.storedWidth = t, this.storedHeight = n, this.title = _, this.monitor = u, this.share = c, this.attributes = Object.assign({}, GLFW.hints), this.inputModes = {
                208897: 212993,
                208898: 0,
                208899: 0
            }, this.buttons = 0, this.keys = new Array, this.domKeys = new Array, this.shouldClose = 0, this.title = null, this.windowPosFunc = 0, this.windowSizeFunc = 0, this.windowCloseFunc = 0, this.windowRefreshFunc = 0, this.windowFocusFunc = 0, this.windowIconifyFunc = 0, this.windowMaximizeFunc = 0, this.framebufferSizeFunc = 0, this.windowContentScaleFunc = 0, this.mouseButtonFunc = 0, this.cursorPosFunc = 0, this.cursorEnterFunc = 0, this.scrollFunc = 0, this.dropFunc = 0, this.keyFunc = 0, this.charFunc = 0, this.userptr = 0
        }
        var GLFW = {
                WindowFromId: r => r <= 0 || !GLFW.windows ? null : GLFW.windows[r - 1],
                joystickFunc: 0,
                errorFunc: 0,
                monitorFunc: 0,
                active: null,
                scale: null,
                windows: null,
                monitors: null,
                monitorString: null,
                versionString: null,
                initialTime: null,
                extensions: null,
                devicePixelRatioMQL: null,
                hints: null,
                primaryTouchId: null,
                defaultHints: {
                    131073: 0,
                    131074: 0,
                    131075: 1,
                    131076: 1,
                    131077: 1,
                    131082: 0,
                    135169: 8,
                    135170: 8,
                    135171: 8,
                    135172: 8,
                    135173: 24,
                    135174: 8,
                    135175: 0,
                    135176: 0,
                    135177: 0,
                    135178: 0,
                    135179: 0,
                    135180: 0,
                    135181: 0,
                    135182: 0,
                    135183: 0,
                    139265: 196609,
                    139266: 1,
                    139267: 0,
                    139268: 0,
                    139269: 0,
                    139270: 0,
                    139271: 0,
                    139272: 0,
                    139276: 0
                },
                DOMToGLFWKeyCode: r => {
                    switch (r) {
                        case 32:
                            return 32;
                        case 222:
                            return 39;
                        case 188:
                            return 44;
                        case 173:
                            return 45;
                        case 189:
                            return 45;
                        case 190:
                            return 46;
                        case 191:
                            return 47;
                        case 48:
                            return 48;
                        case 49:
                            return 49;
                        case 50:
                            return 50;
                        case 51:
                            return 51;
                        case 52:
                            return 52;
                        case 53:
                            return 53;
                        case 54:
                            return 54;
                        case 55:
                            return 55;
                        case 56:
                            return 56;
                        case 57:
                            return 57;
                        case 59:
                            return 59;
                        case 61:
                            return 61;
                        case 187:
                            return 61;
                        case 65:
                            return 65;
                        case 66:
                            return 66;
                        case 67:
                            return 67;
                        case 68:
                            return 68;
                        case 69:
                            return 69;
                        case 70:
                            return 70;
                        case 71:
                            return 71;
                        case 72:
                            return 72;
                        case 73:
                            return 73;
                        case 74:
                            return 74;
                        case 75:
                            return 75;
                        case 76:
                            return 76;
                        case 77:
                            return 77;
                        case 78:
                            return 78;
                        case 79:
                            return 79;
                        case 80:
                            return 80;
                        case 81:
                            return 81;
                        case 82:
                            return 82;
                        case 83:
                            return 83;
                        case 84:
                            return 84;
                        case 85:
                            return 85;
                        case 86:
                            return 86;
                        case 87:
                            return 87;
                        case 88:
                            return 88;
                        case 89:
                            return 89;
                        case 90:
                            return 90;
                        case 219:
                            return 91;
                        case 220:
                            return 92;
                        case 221:
                            return 93;
                        case 192:
                            return 96;
                        case 27:
                            return 256;
                        case 13:
                            return 257;
                        case 9:
                            return 258;
                        case 8:
                            return 259;
                        case 45:
                            return 260;
                        case 46:
                            return 261;
                        case 39:
                            return 262;
                        case 37:
                            return 263;
                        case 40:
                            return 264;
                        case 38:
                            return 265;
                        case 33:
                            return 266;
                        case 34:
                            return 267;
                        case 36:
                            return 268;
                        case 35:
                            return 269;
                        case 20:
                            return 280;
                        case 145:
                            return 281;
                        case 144:
                            return 282;
                        case 44:
                            return 283;
                        case 19:
                            return 284;
                        case 112:
                            return 290;
                        case 113:
                            return 291;
                        case 114:
                            return 292;
                        case 115:
                            return 293;
                        case 116:
                            return 294;
                        case 117:
                            return 295;
                        case 118:
                            return 296;
                        case 119:
                            return 297;
                        case 120:
                            return 298;
                        case 121:
                            return 299;
                        case 122:
                            return 300;
                        case 123:
                            return 301;
                        case 124:
                            return 302;
                        case 125:
                            return 303;
                        case 126:
                            return 304;
                        case 127:
                            return 305;
                        case 128:
                            return 306;
                        case 129:
                            return 307;
                        case 130:
                            return 308;
                        case 131:
                            return 309;
                        case 132:
                            return 310;
                        case 133:
                            return 311;
                        case 134:
                            return 312;
                        case 135:
                            return 313;
                        case 136:
                            return 314;
                        case 96:
                            return 320;
                        case 97:
                            return 321;
                        case 98:
                            return 322;
                        case 99:
                            return 323;
                        case 100:
                            return 324;
                        case 101:
                            return 325;
                        case 102:
                            return 326;
                        case 103:
                            return 327;
                        case 104:
                            return 328;
                        case 105:
                            return 329;
                        case 110:
                            return 330;
                        case 111:
                            return 331;
                        case 106:
                            return 332;
                        case 109:
                            return 333;
                        case 107:
                            return 334;
                        case 16:
                            return 340;
                        case 17:
                            return 341;
                        case 18:
                            return 342;
                        case 91:
                            return 343;
                        case 224:
                            return 343;
                        case 93:
                            return 348;
                        default:
                            return -1
                    }
                },
                getModBits: r => {
                    var t = 0;
                    return r.keys[340] && (t |= 1), r.keys[341] && (t |= 2), r.keys[342] && (t |= 4), (r.keys[343] || r.keys[348]) && (t |= 8), t
                },
                onKeyPress: r => {
                    if (!(!GLFW.active || !GLFW.active.charFunc) && !(r.ctrlKey || r.metaKey)) {
                        var t = r.charCode;
                        t == 0 || t >= 0 && t <= 31 || getWasmTableEntry(GLFW.active.charFunc)(GLFW.active.id, t)
                    }
                },
                onKeyChanged: (r, t) => {
                    if (GLFW.active) {
                        var n = GLFW.DOMToGLFWKeyCode(r);
                        if (n != -1) {
                            var e = t && GLFW.active.keys[n];
                            GLFW.active.keys[n] = t, GLFW.active.domKeys[r] = t, GLFW.active.keyFunc && (e && (t = 2), getWasmTableEntry(GLFW.active.keyFunc)(GLFW.active.id, n, r, t, GLFW.getModBits(GLFW.active)))
                        }
                    }
                },
                onGamepadConnected: r => {
                    GLFW.refreshJoysticks()
                },
                onGamepadDisconnected: r => {
                    GLFW.refreshJoysticks()
                },
                onKeydown: r => {
                    GLFW.onKeyChanged(r.keyCode, 1), (r.keyCode === 8 || r.keyCode === 9) && r.preventDefault()
                },
                onKeyup: r => {
                    GLFW.onKeyChanged(r.keyCode, 0)
                },
                onBlur: r => {
                    if (GLFW.active)
                        for (var t = 0; t < GLFW.active.domKeys.length; ++t) GLFW.active.domKeys[t] && GLFW.onKeyChanged(t, 0)
                },
                onMousemove: r => {
                    if (GLFW.active) {
                        if (r.type === "touchmove") {
                            r.preventDefault();
                            let t = !1;
                            for (let n of r.changedTouches)
                                if (GLFW.primaryTouchId === n.identifier) {
                                    Browser.setMouseCoords(n.pageX, n.pageY), t = !0;
                                    break
                                } if (!t) return
                        } else Browser.calculateMouseEvent(r);
                        r.target != Module.canvas || !GLFW.active.cursorPosFunc || GLFW.active.cursorPosFunc && getWasmTableEntry(GLFW.active.cursorPosFunc)(GLFW.active.id, Browser.mouseX, Browser.mouseY)
                    }
                },
                DOMToGLFWMouseButton: r => {
                    var t = r.button;
                    return t > 0 && (t == 1 ? t = 2 : t = 1), t
                },
                onMouseenter: r => {
                    GLFW.active && r.target == Module.canvas && GLFW.active.cursorEnterFunc && getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 1)
                },
                onMouseleave: r => {
                    GLFW.active && r.target == Module.canvas && GLFW.active.cursorEnterFunc && getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 0)
                },
                onMouseButtonChanged: (r, t) => {
                    if (!GLFW.active || r.target != Module.canvas) return;
                    const n = r.type === "touchstart" || r.type === "touchend" || r.type === "touchcancel";
                    let e = 0;
                    if (n) {
                        r.preventDefault();
                        let a = !1;
                        if (GLFW.primaryTouchId === null && r.type === "touchstart" && r.targetTouches.length > 0) {
                            const _ = r.targetTouches[0];
                            GLFW.primaryTouchId = _.identifier, Browser.setMouseCoords(_.pageX, _.pageY), a = !0
                        } else if (r.type === "touchend" || r.type === "touchcancel") {
                            for (let _ of r.changedTouches)
                                if (GLFW.primaryTouchId === _.identifier) {
                                    GLFW.primaryTouchId = null, a = !0;
                                    break
                                }
                        }
                        if (!a) return
                    } else Browser.calculateMouseEvent(r), e = GLFW.DOMToGLFWMouseButton(r);
                    if (t == 1) {
                        GLFW.active.buttons |= 1 << e;
                        try {
                            r.target.setCapture()
                        } catch {}
                    } else GLFW.active.buttons &= ~(1 << e);
                    GLFW.active.mouseButtonFunc && getWasmTableEntry(GLFW.active.mouseButtonFunc)(GLFW.active.id, e, t, GLFW.getModBits(GLFW.active))
                },
                onMouseButtonDown: r => {
                    GLFW.active && GLFW.onMouseButtonChanged(r, 1)
                },
                onMouseButtonUp: r => {
                    GLFW.active && GLFW.onMouseButtonChanged(r, 0)
                },
                onMouseWheel: r => {
                    var t = -Browser.getMouseWheelDelta(r);
                    if (t = t == 0 ? 0 : t > 0 ? Math.max(t, 1) : Math.min(t, -1), GLFW.wheelPos += t, !(!GLFW.active || !GLFW.active.scrollFunc || r.target != Module.canvas)) {
                        var n = 0,
                            e = t;
                        r.type == "mousewheel" ? n = r.wheelDeltaX : n = r.deltaX, getWasmTableEntry(GLFW.active.scrollFunc)(GLFW.active.id, n, e), r.preventDefault()
                    }
                },
                onCanvasResize: (r, t, n, e) => {
                    if (GLFW.active) {
                        var a = !1;
                        document.fullscreen || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen ? GLFW.active.fullscreen || (a = r != screen.width || t != screen.height, GLFW.active.storedX = GLFW.active.x, GLFW.active.storedY = GLFW.active.y, GLFW.active.storedWidth = GLFW.active.width, GLFW.active.storedHeight = GLFW.active.height, GLFW.active.x = GLFW.active.y = 0, GLFW.active.width = screen.width, GLFW.active.height = screen.height, GLFW.active.fullscreen = !0) : GLFW.active.fullscreen == !0 && (a = r != GLFW.active.storedWidth || t != GLFW.active.storedHeight, GLFW.active.x = GLFW.active.storedX, GLFW.active.y = GLFW.active.storedY, GLFW.active.width = GLFW.active.storedWidth, GLFW.active.height = GLFW.active.storedHeight, GLFW.active.fullscreen = !1), a ? Browser.setCanvasSize(GLFW.active.width, GLFW.active.height) : (GLFW.active.width != r || GLFW.active.height != t || GLFW.active.framebufferWidth != n || GLFW.active.framebufferHeight != e) && (GLFW.active.width = r, GLFW.active.height = t, GLFW.active.framebufferWidth = n, GLFW.active.framebufferHeight = e, GLFW.onWindowSizeChanged(), GLFW.onFramebufferSizeChanged())
                    }
                },
                onWindowSizeChanged: () => {
                    GLFW.active && GLFW.active.windowSizeFunc && getWasmTableEntry(GLFW.active.windowSizeFunc)(GLFW.active.id, GLFW.active.width, GLFW.active.height)
                },
                onFramebufferSizeChanged: () => {
                    GLFW.active && GLFW.active.framebufferSizeFunc && getWasmTableEntry(GLFW.active.framebufferSizeFunc)(GLFW.active.id, GLFW.active.framebufferWidth, GLFW.active.framebufferHeight)
                },
                onWindowContentScaleChanged: r => {
                    GLFW.scale = r, GLFW.active && GLFW.active.windowContentScaleFunc && getWasmTableEntry(GLFW.active.windowContentScaleFunc)(GLFW.active.id, GLFW.scale, GLFW.scale)
                },
                getTime: () => _emscripten_get_now() / 1e3,
                setWindowTitle: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    n && (n.title = t, GLFW.active.id == n.id && _emscripten_set_window_title(t))
                },
                setJoystickCallback: r => {
                    var t = GLFW.joystickFunc;
                    return GLFW.joystickFunc = r, GLFW.refreshJoysticks(), t
                },
                joys: {},
                lastGamepadState: [],
                lastGamepadStateFrame: null,
                refreshJoysticks: () => {
                    if (Browser.mainLoop.currentFrameNumber !== GLFW.lastGamepadStateFrame || !Browser.mainLoop.currentFrameNumber) {
                        GLFW.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads || [], GLFW.lastGamepadStateFrame = Browser.mainLoop.currentFrameNumber;
                        for (var r = 0; r < GLFW.lastGamepadState.length; ++r) {
                            var t = GLFW.lastGamepadState[r];
                            if (t) {
                                GLFW.joys[r] || (out("glfw joystick connected:", r), GLFW.joys[r] = {
                                    id: stringToNewUTF8(t.id),
                                    buttonsCount: t.buttons.length,
                                    axesCount: t.axes.length,
                                    buttons: _malloc(t.buttons.length),
                                    axes: _malloc(t.axes.length * 4)
                                }, GLFW.joystickFunc && getWasmTableEntry(GLFW.joystickFunc)(r, 262145));
                                for (var n = GLFW.joys[r], e = 0; e < t.buttons.length; ++e) HEAP8[n.buttons + e] = t.buttons[e].pressed;
                                for (var e = 0; e < t.axes.length; ++e) HEAPF32[n.axes + e * 4 >> 2] = t.axes[e]
                            } else GLFW.joys[r] && (out("glfw joystick disconnected", r), GLFW.joystickFunc && getWasmTableEntry(GLFW.joystickFunc)(r, 262146), _free(GLFW.joys[r].id), _free(GLFW.joys[r].buttons), _free(GLFW.joys[r].axes), delete GLFW.joys[r])
                        }
                    }
                },
                setKeyCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.keyFunc;
                    return n.keyFunc = t, e
                },
                setCharCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.charFunc;
                    return n.charFunc = t, e
                },
                setMouseButtonCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.mouseButtonFunc;
                    return n.mouseButtonFunc = t, e
                },
                setCursorPosCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.cursorPosFunc;
                    return n.cursorPosFunc = t, e
                },
                setScrollCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.scrollFunc;
                    return n.scrollFunc = t, e
                },
                setDropCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.dropFunc;
                    return n.dropFunc = t, e
                },
                onDrop: r => {
                    if (!GLFW.active || !GLFW.active.dropFunc || !r.dataTransfer || !r.dataTransfer.files || r.dataTransfer.files.length == 0) return;
                    r.preventDefault();
                    var t = _malloc(r.dataTransfer.files.length * 4),
                        n = [],
                        e = r.dataTransfer.files.length,
                        a = 0,
                        _ = ".glfw_dropped_files";
                    FS.createPath("/", _);

                    function u(m) {
                        var M = "/" + _ + "/" + m.name.replace(/\//g, "_"),
                            S = new FileReader;
                        S.onloadend = R => {
                            if (S.readyState != 2) {
                                ++a, out("failed to read dropped file: " + m.name + ": " + S.error);
                                return
                            }
                            var C = R.target.result;
                            if (FS.writeFile(M, new Uint8Array(C)), ++a === e) {
                                getWasmTableEntry(GLFW.active.dropFunc)(GLFW.active.id, e, t);
                                for (var I = 0; I < n.length; ++I) _free(n[I]);
                                _free(t)
                            }
                        }, S.readAsArrayBuffer(m);
                        var L = stringToNewUTF8(M);
                        n.push(L), HEAPU32[t + c * 4 >> 2] = L
                    }
                    for (var c = 0; c < e; ++c) u(r.dataTransfer.files[c]);
                    return !1
                },
                onDragover: r => {
                    if (!(!GLFW.active || !GLFW.active.dropFunc)) return r.preventDefault(), !1
                },
                setWindowSizeCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.windowSizeFunc;
                    return n.windowSizeFunc = t, e
                },
                setWindowCloseCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.windowCloseFunc;
                    return n.windowCloseFunc = t, e
                },
                setWindowRefreshCallback: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    if (!n) return null;
                    var e = n.windowRefreshFunc;
                    return n.windowRefreshFunc = t, e
                },
                onClickRequestPointerLock: r => {
                    !Browser.pointerLock && Module.canvas.requestPointerLock && (Module.canvas.requestPointerLock(), r.preventDefault())
                },
                setInputMode: (r, t, n) => {
                    var e = GLFW.WindowFromId(r);
                    if (e) switch (t) {
                        case 208897: {
                            switch (n) {
                                case 212993: {
                                    e.inputModes[t] = n, Module.canvas.removeEventListener("click", GLFW.onClickRequestPointerLock, !0), Module.canvas.exitPointerLock();
                                    break
                                }
                                case 212994: {
                                    err("glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented");
                                    break
                                }
                                case 212995: {
                                    e.inputModes[t] = n, Module.canvas.addEventListener("click", GLFW.onClickRequestPointerLock, !0), Module.canvas.requestPointerLock();
                                    break
                                }
                                default: {
                                    err(`glfwSetInputMode called with unknown value parameter value: ${n}`);
                                    break
                                }
                            }
                            break
                        }
                        case 208898: {
                            err("glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented");
                            break
                        }
                        case 208899: {
                            err("glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented");
                            break
                        }
                        case 208900: {
                            err("glfwSetInputMode called with GLFW_LOCK_KEY_MODS mode not implemented");
                            break
                        }
                        case 3342341: {
                            err("glfwSetInputMode called with GLFW_RAW_MOUSE_MOTION mode not implemented");
                            break
                        }
                        default: {
                            err(`glfwSetInputMode called with unknown mode parameter value: ${t}`);
                            break
                        }
                    }
                },
                getKey: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    return n ? n.keys[t] : 0
                },
                getMouseButton: (r, t) => {
                    var n = GLFW.WindowFromId(r);
                    return n ? (n.buttons & 1 << t) > 0 : 0
                },
                getCursorPos: (r, t, n) => {
                    HEAPF64[t >> 3] = Browser.mouseX, HEAPF64[n >> 3] = Browser.mouseY
                },
                getMousePos: (r, t, n) => {
                    HEAP32[t >> 2] = Browser.mouseX, HEAP32[n >> 2] = Browser.mouseY
                },
                setCursorPos: (r, t, n) => {},
                getWindowPos: (r, t, n) => {
                    var e = 0,
                        a = 0,
                        _ = GLFW.WindowFromId(r);
                    _ && (e = _.x, a = _.y), t && (HEAP32[t >> 2] = e), n && (HEAP32[n >> 2] = a)
                },
                setWindowPos: (r, t, n) => {
                    var e = GLFW.WindowFromId(r);
                    e && (e.x = t, e.y = n)
                },
                getWindowSize: (r, t, n) => {
                    var e = 0,
                        a = 0,
                        _ = GLFW.WindowFromId(r);
                    _ && (e = _.width, a = _.height), t && (HEAP32[t >> 2] = e), n && (HEAP32[n >> 2] = a)
                },
                setWindowSize: (r, t, n) => {
                    var e = GLFW.WindowFromId(r);
                    e && GLFW.active.id == e.id && Browser.setCanvasSize(t, n)
                },
                defaultWindowHints: () => {
                    GLFW.hints = Object.assign({}, GLFW.defaultHints)
                },
                createWindow: (r, t, n, e, a) => {
                    var _, u;
                    for (_ = 0; _ < GLFW.windows.length && GLFW.windows[_] !== null; _++);
                    if (_ > 0) throw "glfwCreateWindow only supports one window at time currently";
                    if (u = _ + 1, r <= 0 || t <= 0) return 0;
                    for (e ? Browser.requestFullscreen() : Browser.setCanvasSize(r, t), _ = 0; _ < GLFW.windows.length && GLFW.windows[_] == null; _++);
                    var c = GLFW.hints[139265] > 0;
                    if (_ == GLFW.windows.length)
                        if (c) {
                            var m = {
                                antialias: GLFW.hints[135181] > 1,
                                depth: GLFW.hints[135173] > 0,
                                stencil: GLFW.hints[135174] > 0,
                                alpha: GLFW.hints[135172] > 0
                            };
                            Module.ctx = Browser.createContext(Module.canvas, !0, !0, m)
                        } else Browser.init();
                    if (!Module.ctx && c) return 0;
                    const M = Module.canvas;
                    var S = new GLFW_Window(u, M.clientWidth, M.clientHeight, M.width, M.height, n, e, a);
                    return u - 1 == GLFW.windows.length ? GLFW.windows.push(S) : GLFW.windows[u - 1] = S, GLFW.active = S, GLFW.adjustCanvasDimensions(), S.id
                },
                destroyWindow: r => {
                    var t = GLFW.WindowFromId(r);
                    if (t) {
                        t.windowCloseFunc && getWasmTableEntry(t.windowCloseFunc)(t.id), GLFW.windows[t.id - 1] = null, GLFW.active.id == t.id && (GLFW.active = null);
                        for (var n = 0; n < GLFW.windows.length; n++)
                            if (GLFW.windows[n] !== null) return;
                        Module.ctx = Browser.destroyContext(Module.canvas, !0, !0)
                    }
                },
                swapBuffers: r => {},
                requestFullscreen(r, t) {
                    Browser.lockPointer = r, Browser.resizeCanvas = t, typeof Browser.lockPointer > "u" && (Browser.lockPointer = !0), typeof Browser.resizeCanvas > "u" && (Browser.resizeCanvas = !1);
                    var n = Module.canvas;

                    function e() {
                        Browser.isFullscreen = !1;
                        var _ = n.parentNode;
                        (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === _ ? (n.exitFullscreen = Browser.exitFullscreen, Browser.lockPointer && n.requestPointerLock(), Browser.isFullscreen = !0, Browser.resizeCanvas ? Browser.setFullscreenCanvasSize() : (Browser.updateCanvasDimensions(n), Browser.updateResizeListeners())) : (_.parentNode.insertBefore(n, _), _.parentNode.removeChild(_), Browser.resizeCanvas ? Browser.setWindowedCanvasSize() : (Browser.updateCanvasDimensions(n), Browser.updateResizeListeners())), Module.onFullScreen && Module.onFullScreen(Browser.isFullscreen), Module.onFullscreen && Module.onFullscreen(Browser.isFullscreen)
                    }
                    Browser.fullscreenHandlersInstalled || (Browser.fullscreenHandlersInstalled = !0, document.addEventListener("fullscreenchange", e, !1), document.addEventListener("mozfullscreenchange", e, !1), document.addEventListener("webkitfullscreenchange", e, !1), document.addEventListener("MSFullscreenChange", e, !1));
                    var a = document.createElement("div");
                    n.parentNode.insertBefore(a, n), a.appendChild(n), a.requestFullscreen = a.requestFullscreen || a.mozRequestFullScreen || a.msRequestFullscreen || (a.webkitRequestFullscreen ? () => a.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) : null) || (a.webkitRequestFullScreen ? () => a.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) : null), a.requestFullscreen()
                },
                updateCanvasDimensions(r, t, n) {
                    const e = GLFW.getHiDPIScale();
                    t && n ? (r.widthNative = t, r.heightNative = n) : (t = r.widthNative, n = r.heightNative);
                    var a = t,
                        _ = n;
                    if (Module.forcedAspectRatio && Module.forcedAspectRatio > 0 && (a / _ < Module.forcedAspectRatio ? a = Math.round(_ * Module.forcedAspectRatio) : _ = Math.round(a / Module.forcedAspectRatio)), (document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement || document.webkitCurrentFullScreenElement) === r.parentNode && typeof screen < "u") {
                        var u = Math.min(screen.width / a, screen.height / _);
                        a = Math.round(a * u), _ = Math.round(_ * u)
                    }
                    Browser.resizeCanvas && (t = a, n = _);
                    const c = Math.floor(t * e),
                        m = Math.floor(n * e);
                    r.width != c && (r.width = c), r.height != m && (r.height = m), typeof r.style < "u" && (c != t || m != n ? (r.style.setProperty("width", t + "px", "important"), r.style.setProperty("height", n + "px", "important")) : (r.style.removeProperty("width"), r.style.removeProperty("height")))
                },
                calculateMouseCoords(r, t) {
                    var n = Module.canvas.getBoundingClientRect(),
                        e = Module.canvas.clientWidth,
                        a = Module.canvas.clientHeight,
                        _ = typeof window.scrollX < "u" ? window.scrollX : window.pageXOffset,
                        u = typeof window.scrollY < "u" ? window.scrollY : window.pageYOffset,
                        c = r - (_ + n.left),
                        m = t - (u + n.top);
                    return c = c * (e / n.width), m = m * (a / n.height), {
                        x: c,
                        y: m
                    }
                },
                setWindowAttrib: (r, t, n) => {
                    var e = GLFW.WindowFromId(r);
                    if (!e) return;
                    const a = GLFW.isHiDPIAware();
                    e.attributes[t] = n, a !== GLFW.isHiDPIAware() && GLFW.adjustCanvasDimensions()
                },
                getDevicePixelRatio() {
                    return typeof devicePixelRatio == "number" && devicePixelRatio || 1
                },
                isHiDPIAware() {
                    return GLFW.active ? GLFW.active.attributes[139276] > 0 : !1
                },
                adjustCanvasDimensions() {
                    const r = Module.canvas;
                    Browser.updateCanvasDimensions(r, r.clientWidth, r.clientHeight), Browser.updateResizeListeners()
                },
                getHiDPIScale() {
                    return GLFW.isHiDPIAware() ? GLFW.scale : 1
                },
                onDevicePixelRatioChange() {
                    GLFW.onWindowContentScaleChanged(GLFW.getDevicePixelRatio()), GLFW.adjustCanvasDimensions()
                },
                GLFW2ParamToGLFW3Param: r => {
                    var t = {
                        196609: 0,
                        196610: 0,
                        196611: 0,
                        196612: 0,
                        196613: 0,
                        196614: 0,
                        131073: 0,
                        131074: 0,
                        131075: 0,
                        131076: 0,
                        131077: 135169,
                        131078: 135170,
                        131079: 135171,
                        131080: 135172,
                        131081: 135173,
                        131082: 135174,
                        131083: 135183,
                        131084: 135175,
                        131085: 135176,
                        131086: 135177,
                        131087: 135178,
                        131088: 135179,
                        131089: 135180,
                        131090: 0,
                        131091: 135181,
                        131092: 139266,
                        131093: 139267,
                        131094: 139270,
                        131095: 139271,
                        131096: 139272
                    };
                    return t[r]
                }
            },
            _glfwCreateWindow = (r, t, n, e, a) => GLFW.createWindow(r, t, n, e, a),
            _glfwDefaultWindowHints = () => GLFW.defaultWindowHints(),
            _glfwDestroyWindow = r => GLFW.destroyWindow(r),
            _glfwGetPrimaryMonitor = () => 1,
            _glfwGetTime = () => GLFW.getTime() - GLFW.initialTime,
            _glfwGetVideoModes = (r, t) => (HEAP32[t >> 2] = 0, 0),
            _glfwInit = () => (GLFW.windows || (GLFW.initialTime = GLFW.getTime(), GLFW.defaultWindowHints(), GLFW.windows = new Array, GLFW.active = null, GLFW.scale = GLFW.getDevicePixelRatio(), window.addEventListener("gamepadconnected", GLFW.onGamepadConnected, !0), window.addEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, !0), window.addEventListener("keydown", GLFW.onKeydown, !0), window.addEventListener("keypress", GLFW.onKeyPress, !0), window.addEventListener("keyup", GLFW.onKeyup, !0), window.addEventListener("blur", GLFW.onBlur, !0), GLFW.devicePixelRatioMQL = window.matchMedia("(resolution: " + GLFW.getDevicePixelRatio() + "dppx)"), GLFW.devicePixelRatioMQL.addEventListener("change", GLFW.onDevicePixelRatioChange), Module.canvas.addEventListener("touchmove", GLFW.onMousemove, !0), Module.canvas.addEventListener("touchstart", GLFW.onMouseButtonDown, !0), Module.canvas.addEventListener("touchcancel", GLFW.onMouseButtonUp, !0), Module.canvas.addEventListener("touchend", GLFW.onMouseButtonUp, !0), Module.canvas.addEventListener("mousemove", GLFW.onMousemove, !0), Module.canvas.addEventListener("mousedown", GLFW.onMouseButtonDown, !0), Module.canvas.addEventListener("mouseup", GLFW.onMouseButtonUp, !0), Module.canvas.addEventListener("wheel", GLFW.onMouseWheel, !0), Module.canvas.addEventListener("mousewheel", GLFW.onMouseWheel, !0), Module.canvas.addEventListener("mouseenter", GLFW.onMouseenter, !0), Module.canvas.addEventListener("mouseleave", GLFW.onMouseleave, !0), Module.canvas.addEventListener("drop", GLFW.onDrop, !0), Module.canvas.addEventListener("dragover", GLFW.onDragover, !0), Browser.requestFullscreen = GLFW.requestFullscreen, Browser.calculateMouseCoords = GLFW.calculateMouseCoords, Browser.updateCanvasDimensions = GLFW.updateCanvasDimensions, Browser.resizeListeners.push((r, t) => {
                if (GLFW.isHiDPIAware()) {
                    var n = Module.canvas;
                    GLFW.onCanvasResize(n.clientWidth, n.clientHeight, r, t)
                } else GLFW.onCanvasResize(r, t, r, t)
            })), 1),
            _glfwMakeContextCurrent = r => {},
            _glfwSetCharCallback = (r, t) => GLFW.setCharCallback(r, t),
            _glfwSetCursorEnterCallback = (r, t) => {
                var n = GLFW.WindowFromId(r);
                if (!n) return null;
                var e = n.cursorEnterFunc;
                return n.cursorEnterFunc = t, e
            },
            _glfwSetCursorPos = (r, t, n) => GLFW.setCursorPos(r, t, n),
            _glfwSetCursorPosCallback = (r, t) => GLFW.setCursorPosCallback(r, t),
            _glfwSetDropCallback = (r, t) => GLFW.setDropCallback(r, t),
            _glfwSetErrorCallback = r => {
                var t = GLFW.errorFunc;
                return GLFW.errorFunc = r, t
            },
            _glfwSetKeyCallback = (r, t) => GLFW.setKeyCallback(r, t),
            _glfwSetMouseButtonCallback = (r, t) => GLFW.setMouseButtonCallback(r, t),
            _glfwSetScrollCallback = (r, t) => GLFW.setScrollCallback(r, t),
            _glfwSetWindowFocusCallback = (r, t) => {
                var n = GLFW.WindowFromId(r);
                if (!n) return null;
                var e = n.windowFocusFunc;
                return n.windowFocusFunc = t, e
            },
            _glfwSetWindowIconifyCallback = (r, t) => {
                var n = GLFW.WindowFromId(r);
                if (!n) return null;
                var e = n.windowIconifyFunc;
                return n.windowIconifyFunc = t, e
            },
            _glfwSetWindowShouldClose = (r, t) => {
                var n = GLFW.WindowFromId(r);
                n && (n.shouldClose = t)
            },
            _glfwSetWindowSize = (r, t, n) => GLFW.setWindowSize(r, t, n),
            _glfwSetWindowSizeCallback = (r, t) => GLFW.setWindowSizeCallback(r, t),
            _glfwSwapBuffers = r => GLFW.swapBuffers(r),
            _glfwTerminate = () => {
                window.removeEventListener("gamepadconnected", GLFW.onGamepadConnected, !0), window.removeEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, !0), window.removeEventListener("keydown", GLFW.onKeydown, !0), window.removeEventListener("keypress", GLFW.onKeyPress, !0), window.removeEventListener("keyup", GLFW.onKeyup, !0), window.removeEventListener("blur", GLFW.onBlur, !0), Module.canvas.removeEventListener("touchmove", GLFW.onMousemove, !0), Module.canvas.removeEventListener("touchstart", GLFW.onMouseButtonDown, !0), Module.canvas.removeEventListener("touchcancel", GLFW.onMouseButtonUp, !0), Module.canvas.removeEventListener("touchend", GLFW.onMouseButtonUp, !0), Module.canvas.removeEventListener("mousemove", GLFW.onMousemove, !0), Module.canvas.removeEventListener("mousedown", GLFW.onMouseButtonDown, !0), Module.canvas.removeEventListener("mouseup", GLFW.onMouseButtonUp, !0), Module.canvas.removeEventListener("wheel", GLFW.onMouseWheel, !0), Module.canvas.removeEventListener("mousewheel", GLFW.onMouseWheel, !0), Module.canvas.removeEventListener("mouseenter", GLFW.onMouseenter, !0), Module.canvas.removeEventListener("mouseleave", GLFW.onMouseleave, !0), Module.canvas.removeEventListener("drop", GLFW.onDrop, !0), Module.canvas.removeEventListener("dragover", GLFW.onDragover, !0), GLFW.devicePixelRatioMQL && GLFW.devicePixelRatioMQL.removeEventListener("change", GLFW.onDevicePixelRatioChange), Module.canvas.width = Module.canvas.height = 1, GLFW.windows = null, GLFW.active = null
            },
            _glfwWindowHint = (r, t) => {
                GLFW.hints[r] = t
            },
            getCFunc = r => {
                var t = Module["_" + r];
                return t
            },
            writeArrayToMemory = (r, t) => {
                HEAP8.set(r, t)
            },
            stackAlloc = r => __emscripten_stack_alloc(r),
            stringToUTF8OnStack = r => {
                var t = lengthBytesUTF8(r) + 1,
                    n = stackAlloc(t);
                return stringToUTF8(r, n, t), n
            },
            ccall = (r, t, n, e, a) => {
                var _ = {
                    string: I => {
                        var T = 0;
                        return I != null && I !== 0 && (T = stringToUTF8OnStack(I)), T
                    },
                    array: I => {
                        var T = stackAlloc(I.length);
                        return writeArrayToMemory(I, T), T
                    }
                };

                function u(I) {
                    return t === "string" ? UTF8ToString(I) : t === "boolean" ? !!I : I
                }
                var c = getCFunc(r),
                    m = [],
                    M = 0;
                if (e)
                    for (var S = 0; S < e.length; S++) {
                        var L = _[n[S]];
                        L ? (M === 0 && (M = stackSave()), m[S] = L(e[S])) : m[S] = e[S]
                    }
                var R = c(...m);

                function C(I) {
                    return M !== 0 && stackRestore(M), u(I)
                }
                return R = C(R), R
            },
            cwrap = (r, t, n, e) => {
                var a = !n || n.every(u => u === "number" || u === "boolean"),
                    _ = t !== "string";
                return _ && a && !e ? getCFunc(r) : (...u) => ccall(r, t, n, u)
            },
            allocateUTF8 = stringToNewUTF8;
        FS.createPreloadedFile = FS_createPreloadedFile, FS.staticInit();
        for (var GLctx, i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));
        for (var miniTempWebGLFloatBuffersStorage = new Float32Array(288), i = 0; i < 288; ++i) miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
        for (var miniTempWebGLIntBuffersStorage = new Int32Array(288), i = 0; i < 288; ++i) miniTempWebGLIntBuffers[i] = miniTempWebGLIntBuffersStorage.subarray(0, i);
        Module.requestFullscreen = Browser.requestFullscreen, Module.requestAnimationFrame = Browser.requestAnimationFrame, Module.setCanvasSize = Browser.setCanvasSize, Module.pauseMainLoop = Browser.mainLoop.pause, Module.resumeMainLoop = Browser.mainLoop.resume, Module.getUserMedia = Browser.getUserMedia, Module.createContext = Browser.createContext;
        var wasmImports = {
                xe: GetWindowInnerHeight,
                ye: GetWindowInnerWidth,
                hb: ___syscall_chdir,
                ib: ___syscall_faccessat,
                da: ___syscall_fcntl64,
                cb: ___syscall_getcwd,
                bb: ___syscall_getdents64,
                eb: ___syscall_ioctl,
                ea: ___syscall_openat,
                ab: ___syscall_stat64,
                gb: __emscripten_memcpy_js,
                l: _emscripten_asm_const_int,
                fb: _emscripten_date_now,
                re: _emscripten_exit_pointerlock,
                ve: _emscripten_get_element_css_size,
                ne: _emscripten_get_gamepad_status,
                fa: _emscripten_get_now,
                oe: _emscripten_get_num_gamepads,
                Ud: _emscripten_glActiveTexture,
                Td: _emscripten_glAttachShader,
                ie: _emscripten_glBeginQueryEXT,
                Sd: _emscripten_glBindAttribLocation,
                Rd: _emscripten_glBindBuffer,
                Qd: _emscripten_glBindFramebuffer,
                Pd: _emscripten_glBindRenderbuffer,
                Od: _emscripten_glBindTexture,
                ae: _emscripten_glBindVertexArrayOES,
                Nd: _emscripten_glBlendColor,
                Md: _emscripten_glBlendEquation,
                Ld: _emscripten_glBlendEquationSeparate,
                Kd: _emscripten_glBlendFunc,
                Jd: _emscripten_glBlendFuncSeparate,
                Id: _emscripten_glBufferData,
                Hd: _emscripten_glBufferSubData,
                Gd: _emscripten_glCheckFramebufferStatus,
                Fd: _emscripten_glClear,
                Ed: _emscripten_glClearColor,
                Dd: _emscripten_glClearDepthf,
                Cd: _emscripten_glClearStencil,
                Bd: _emscripten_glColorMask,
                Ad: _emscripten_glCompileShader,
                zd: _emscripten_glCompressedTexImage2D,
                yd: _emscripten_glCompressedTexSubImage2D,
                xd: _emscripten_glCopyTexImage2D,
                wd: _emscripten_glCopyTexSubImage2D,
                vd: _emscripten_glCreateProgram,
                ud: _emscripten_glCreateShader,
                td: _emscripten_glCullFace,
                sd: _emscripten_glDeleteBuffers,
                rd: _emscripten_glDeleteFramebuffers,
                qd: _emscripten_glDeleteProgram,
                ke: _emscripten_glDeleteQueriesEXT,
                pd: _emscripten_glDeleteRenderbuffers,
                od: _emscripten_glDeleteShader,
                nd: _emscripten_glDeleteTextures,
                $d: _emscripten_glDeleteVertexArraysOES,
                md: _emscripten_glDepthFunc,
                ld: _emscripten_glDepthMask,
                kd: _emscripten_glDepthRangef,
                jd: _emscripten_glDetachShader,
                id: _emscripten_glDisable,
                hd: _emscripten_glDisableVertexAttribArray,
                gd: _emscripten_glDrawArrays,
                Xd: _emscripten_glDrawArraysInstancedANGLE,
                Yd: _emscripten_glDrawBuffersWEBGL,
                fd: _emscripten_glDrawElements,
                Wd: _emscripten_glDrawElementsInstancedANGLE,
                ed: _emscripten_glEnable,
                dd: _emscripten_glEnableVertexAttribArray,
                he: _emscripten_glEndQueryEXT,
                cd: _emscripten_glFinish,
                bd: _emscripten_glFlush,
                ad: _emscripten_glFramebufferRenderbuffer,
                $c: _emscripten_glFramebufferTexture2D,
                _c: _emscripten_glFrontFace,
                Zc: _emscripten_glGenBuffers,
                Xc: _emscripten_glGenFramebuffers,
                le: _emscripten_glGenQueriesEXT,
                Wc: _emscripten_glGenRenderbuffers,
                Vc: _emscripten_glGenTextures,
                _d: _emscripten_glGenVertexArraysOES,
                Yc: _emscripten_glGenerateMipmap,
                Uc: _emscripten_glGetActiveAttrib,
                Tc: _emscripten_glGetActiveUniform,
                Sc: _emscripten_glGetAttachedShaders,
                Rc: _emscripten_glGetAttribLocation,
                Qc: _emscripten_glGetBooleanv,
                Oc: _emscripten_glGetBufferParameteriv,
                Nc: _emscripten_glGetError,
                Mc: _emscripten_glGetFloatv,
                Lc: _emscripten_glGetFramebufferAttachmentParameteriv,
                Kc: _emscripten_glGetIntegerv,
                Ic: _emscripten_glGetProgramInfoLog,
                Jc: _emscripten_glGetProgramiv,
                ce: _emscripten_glGetQueryObjecti64vEXT,
                ee: _emscripten_glGetQueryObjectivEXT,
                be: _emscripten_glGetQueryObjectui64vEXT,
                de: _emscripten_glGetQueryObjectuivEXT,
                fe: _emscripten_glGetQueryivEXT,
                Hc: _emscripten_glGetRenderbufferParameteriv,
                Fc: _emscripten_glGetShaderInfoLog,
                Ec: _emscripten_glGetShaderPrecisionFormat,
                Dc: _emscripten_glGetShaderSource,
                Gc: _emscripten_glGetShaderiv,
                Cc: _emscripten_glGetString,
                Bc: _emscripten_glGetTexParameterfv,
                Ac: _emscripten_glGetTexParameteriv,
                xc: _emscripten_glGetUniformLocation,
                zc: _emscripten_glGetUniformfv,
                yc: _emscripten_glGetUniformiv,
                uc: _emscripten_glGetVertexAttribPointerv,
                wc: _emscripten_glGetVertexAttribfv,
                vc: _emscripten_glGetVertexAttribiv,
                tc: _emscripten_glHint,
                sc: _emscripten_glIsBuffer,
                rc: _emscripten_glIsEnabled,
                qc: _emscripten_glIsFramebuffer,
                pc: _emscripten_glIsProgram,
                je: _emscripten_glIsQueryEXT,
                oc: _emscripten_glIsRenderbuffer,
                nc: _emscripten_glIsShader,
                mc: _emscripten_glIsTexture,
                Zd: _emscripten_glIsVertexArrayOES,
                lc: _emscripten_glLineWidth,
                kc: _emscripten_glLinkProgram,
                jc: _emscripten_glPixelStorei,
                ic: _emscripten_glPolygonOffset,
                ge: _emscripten_glQueryCounterEXT,
                hc: _emscripten_glReadPixels,
                gc: _emscripten_glReleaseShaderCompiler,
                fc: _emscripten_glRenderbufferStorage,
                ec: _emscripten_glSampleCoverage,
                dc: _emscripten_glScissor,
                cc: _emscripten_glShaderBinary,
                bc: _emscripten_glShaderSource,
                $b: _emscripten_glStencilFunc,
                _b: _emscripten_glStencilFuncSeparate,
                Zb: _emscripten_glStencilMask,
                Yb: _emscripten_glStencilMaskSeparate,
                Xb: _emscripten_glStencilOp,
                Wb: _emscripten_glStencilOpSeparate,
                Vb: _emscripten_glTexImage2D,
                Ub: _emscripten_glTexParameterf,
                Tb: _emscripten_glTexParameterfv,
                Sb: _emscripten_glTexParameteri,
                Rb: _emscripten_glTexParameteriv,
                Qb: _emscripten_glTexSubImage2D,
                Pb: _emscripten_glUniform1f,
                Ob: _emscripten_glUniform1fv,
                Nb: _emscripten_glUniform1i,
                Mb: _emscripten_glUniform1iv,
                Lb: _emscripten_glUniform2f,
                Kb: _emscripten_glUniform2fv,
                Jb: _emscripten_glUniform2i,
                Ib: _emscripten_glUniform2iv,
                Hb: _emscripten_glUniform3f,
                Gb: _emscripten_glUniform3fv,
                Fb: _emscripten_glUniform3i,
                Eb: _emscripten_glUniform3iv,
                Db: _emscripten_glUniform4f,
                Cb: _emscripten_glUniform4fv,
                Bb: _emscripten_glUniform4i,
                Ab: _emscripten_glUniform4iv,
                zb: _emscripten_glUniformMatrix2fv,
                yb: _emscripten_glUniformMatrix3fv,
                wb: _emscripten_glUniformMatrix4fv,
                vb: _emscripten_glUseProgram,
                ub: _emscripten_glValidateProgram,
                tb: _emscripten_glVertexAttrib1f,
                sb: _emscripten_glVertexAttrib1fv,
                rb: _emscripten_glVertexAttrib2f,
                qb: _emscripten_glVertexAttrib2fv,
                pb: _emscripten_glVertexAttrib3f,
                ob: _emscripten_glVertexAttrib3fv,
                nb: _emscripten_glVertexAttrib4f,
                lb: _emscripten_glVertexAttrib4fv,
                Vd: _emscripten_glVertexAttribDivisorANGLE,
                kb: _emscripten_glVertexAttribPointer,
                jb: _emscripten_glViewport,
                qe: _emscripten_request_pointerlock,
                $a: _emscripten_resize_heap,
                R: _emscripten_run_script,
                pe: _emscripten_sample_gamepad_data,
                we: _emscripten_set_canvas_element_size,
                Fe: _emscripten_set_click_callback_on_thread,
                He: _emscripten_set_fullscreenchange_callback_on_thread,
                Ae: _emscripten_set_gamepadconnected_callback_on_thread,
                ze: _emscripten_set_gamepaddisconnected_callback_on_thread,
                Ge: _emscripten_set_resize_callback_on_thread,
                Be: _emscripten_set_touchcancel_callback_on_thread,
                De: _emscripten_set_touchend_callback_on_thread,
                Ce: _emscripten_set_touchmove_callback_on_thread,
                Ee: _emscripten_set_touchstart_callback_on_thread,
                ra: _emscripten_set_window_title,
                te: _emscripten_sleep,
                ia: _exit,
                G: _fd_close,
                db: _fd_read,
                _a: _fd_seek,
                ca: _fd_write,
                z: _glActiveTexture,
                Y: _glAttachShader,
                A: _glBindAttribLocation,
                c: _glBindBuffer,
                h: _glBindFramebuffer,
                ba: _glBindRenderbuffer,
                b: _glBindTexture,
                s: _glBlendEquation,
                mb: _glBlendEquationSeparate,
                p: _glBlendFunc,
                xb: _glBlendFuncSeparate,
                q: _glBufferData,
                C: _glBufferSubData,
                Pa: _glCheckFramebufferStatus,
                O: _glClear,
                P: _glClearColor,
                Xa: _glClearDepthf,
                Ma: _glCompileShader,
                x: _glCompressedTexImage2D,
                Ka: _glCreateProgram,
                Oa: _glCreateShader,
                ga: _glCullFace,
                w: _glDeleteBuffers,
                Qa: _glDeleteFramebuffers,
                D: _glDeleteProgram,
                Ra: _glDeleteRenderbuffers,
                E: _glDeleteShader,
                L: _glDeleteTextures,
                Za: _glDepthFunc,
                ha: _glDepthMask,
                F: _glDetachShader,
                y: _glDisable,
                i: _glDisableVertexAttribArray,
                I: _glDrawArrays,
                ka: _glDrawElements,
                t: _glEnable,
                a: _glEnableVertexAttribArray,
                K: _glFramebufferRenderbuffer,
                B: _glFramebufferTexture2D,
                Ya: _glFrontFace,
                r: _glGenBuffers,
                aa: _glGenFramebuffers,
                Va: _glGenRenderbuffers,
                N: _glGenTextures,
                Sa: _glGenerateMipmap,
                m: _glGetAttribLocation,
                ac: _glGetError,
                Q: _glGetFloatv,
                _: _glGetFramebufferAttachmentParameteriv,
                Ha: _glGetProgramInfoLog,
                X: _glGetProgramiv,
                La: _glGetShaderInfoLog,
                Z: _glGetShaderiv,
                o: _glGetString,
                g: _glGetUniformLocation,
                Pc: _glLineWidth,
                Ja: _glLinkProgram,
                Wa: _glPixelStorei,
                $: _glReadPixels,
                Ua: _glRenderbufferStorage,
                H: _glScissor,
                Na: _glShaderSource,
                f: _glTexImage2D,
                u: _glTexParameterf,
                d: _glTexParameteri,
                Ta: _glTexSubImage2D,
                Ga: _glUniform1fv,
                J: _glUniform1i,
                W: _glUniform1iv,
                Fa: _glUniform2fv,
                Ca: _glUniform2iv,
                Ea: _glUniform3fv,
                Ba: _glUniform3iv,
                Ia: _glUniform4f,
                Da: _glUniform4fv,
                Aa: _glUniform4iv,
                M: _glUniformMatrix4fv,
                j: _glUseProgram,
                za: _glVertexAttrib1fv,
                ya: _glVertexAttrib2fv,
                xa: _glVertexAttrib3fv,
                wa: _glVertexAttrib4fv,
                k: _glVertexAttribPointer,
                v: _glViewport,
                U: _glfwCreateWindow,
                ta: _glfwDefaultWindowHints,
                ue: _glfwDestroyWindow,
                V: _glfwGetPrimaryMonitor,
                e: _glfwGetTime,
                sa: _glfwGetVideoModes,
                ua: _glfwInit,
                Ie: _glfwMakeContextCurrent,
                la: _glfwSetCharCallback,
                Je: _glfwSetCursorEnterCallback,
                S: _glfwSetCursorPos,
                Le: _glfwSetCursorPosCallback,
                na: _glfwSetDropCallback,
                va: _glfwSetErrorCallback,
                ma: _glfwSetKeyCallback,
                Me: _glfwSetMouseButtonCallback,
                Ke: _glfwSetScrollCallback,
                oa: _glfwSetWindowFocusCallback,
                pa: _glfwSetWindowIconifyCallback,
                me: _glfwSetWindowShouldClose,
                se: _glfwSetWindowSize,
                qa: _glfwSetWindowSizeCallback,
                ja: _glfwSwapBuffers,
                T: _glfwTerminate,
                n: _glfwWindowHint
            },
            wasmExports = createWasm();
        Module._GuiEnable = () => (Module._GuiEnable = wasmExports.Pe)(), Module._GuiDisable = () => (Module._GuiDisable = wasmExports.Qe)(), Module._GuiLock = () => (Module._GuiLock = wasmExports.Re)(), Module._GuiUnlock = () => (Module._GuiUnlock = wasmExports.Se)(), Module._GuiIsLocked = () => (Module._GuiIsLocked = wasmExports.Te)(), Module._GuiSetAlpha = r => (Module._GuiSetAlpha = wasmExports.Ue)(r), Module._GuiSetState = r => (Module._GuiSetState = wasmExports.Ve)(r), Module._GuiGetState = () => (Module._GuiGetState = wasmExports.We)(), Module._GuiSetFont = r => (Module._GuiSetFont = wasmExports.Xe)(r), Module._GuiLoadStyleDefault = () => (Module._GuiLoadStyleDefault = wasmExports.Ye)(), Module._GetFontDefault = r => (Module._GetFontDefault = wasmExports.Ze)(r), Module._UnloadTexture = r => (Module._UnloadTexture = wasmExports._e)(r);
        var _free = Module._free = r => (_free = Module._free = wasmExports.$e)(r);
        Module._SetShapesTexture = (r, t) => (Module._SetShapesTexture = wasmExports.af)(r, t), Module._GuiGetFont = r => (Module._GuiGetFont = wasmExports.bf)(r), Module._GuiSetStyle = (r, t, n) => (Module._GuiSetStyle = wasmExports.cf)(r, t, n), Module._GuiGetStyle = (r, t) => (Module._GuiGetStyle = wasmExports.df)(r, t), Module._GuiWindowBox = (r, t) => (Module._GuiWindowBox = wasmExports.ef)(r, t), Module._GuiStatusBar = (r, t) => (Module._GuiStatusBar = wasmExports.ff)(r, t), Module._GuiPanel = (r, t) => (Module._GuiPanel = wasmExports.gf)(r, t), Module._GuiButton = (r, t) => (Module._GuiButton = wasmExports.hf)(r, t), Module._GetColor = (r, t) => (Module._GetColor = wasmExports.jf)(r, t), Module._GetMousePosition = r => (Module._GetMousePosition = wasmExports.kf)(r), Module._CheckCollisionPointRec = (r, t) => (Module._CheckCollisionPointRec = wasmExports.lf)(r, t), Module._IsMouseButtonDown = r => (Module._IsMouseButtonDown = wasmExports.mf)(r), Module._IsMouseButtonReleased = r => (Module._IsMouseButtonReleased = wasmExports.nf)(r), Module._GuiIconText = (r, t) => (Module._GuiIconText = wasmExports.of)(r, t), Module._GuiGroupBox = (r, t) => (Module._GuiGroupBox = wasmExports.pf)(r, t), Module._GuiLine = (r, t) => (Module._GuiLine = wasmExports.qf)(r, t), Module._DrawRectangle = (r, t, n, e, a) => (Module._DrawRectangle = wasmExports.rf)(r, t, n, e, a), Module._GetCodepointNext = (r, t) => (Module._GetCodepointNext = wasmExports.sf)(r, t), Module._GetGlyphIndex = (r, t) => (Module._GetGlyphIndex = wasmExports.tf)(r, t), Module._TextToInteger = r => (Module._TextToInteger = wasmExports.uf)(r), Module._GuiDrawIcon = (r, t, n, e, a) => (Module._GuiDrawIcon = wasmExports.vf)(r, t, n, e, a), Module._GetCodepoint = (r, t) => (Module._GetCodepoint = wasmExports.wf)(r, t), Module._DrawTextCodepoint = (r, t, n, e, a) => (Module._DrawTextCodepoint = wasmExports.xf)(r, t, n, e, a), Module._GuiTabBar = (r, t, n, e) => (Module._GuiTabBar = wasmExports.yf)(r, t, n, e), Module._GetScreenWidth = () => (Module._GetScreenWidth = wasmExports.zf)(), Module._GuiToggle = (r, t, n) => (Module._GuiToggle = wasmExports.Af)(r, t, n), Module._GuiScrollPanel = (r, t, n, e, a) => (Module._GuiScrollPanel = wasmExports.Bf)(r, t, n, e, a), Module._GetMouseWheelMove = () => (Module._GetMouseWheelMove = wasmExports.Cf)(), Module._IsKeyDown = r => (Module._IsKeyDown = wasmExports.Df)(r), Module._IsMouseButtonPressed = r => (Module._IsMouseButtonPressed = wasmExports.Ef)(r), Module._GuiLabel = (r, t) => (Module._GuiLabel = wasmExports.Ff)(r, t), Module._MeasureTextEx = (r, t, n, e, a) => (Module._MeasureTextEx = wasmExports.Gf)(r, t, n, e, a), Module._GuiLabelButton = (r, t) => (Module._GuiLabelButton = wasmExports.Hf)(r, t), Module._GuiToggleGroup = (r, t, n) => (Module._GuiToggleGroup = wasmExports.If)(r, t, n), Module._GuiToggleSlider = (r, t, n) => (Module._GuiToggleSlider = wasmExports.Jf)(r, t, n), Module._Fade = (r, t, n) => (Module._Fade = wasmExports.Kf)(r, t, n), Module._GuiCheckBox = (r, t, n) => (Module._GuiCheckBox = wasmExports.Lf)(r, t, n), Module._GuiComboBox = (r, t, n) => (Module._GuiComboBox = wasmExports.Mf)(r, t, n), Module._TextFormat = (r, t) => (Module._TextFormat = wasmExports.Nf)(r, t), Module._GuiDropdownBox = (r, t, n, e) => (Module._GuiDropdownBox = wasmExports.Of)(r, t, n, e), Module._GuiTextBox = (r, t, n, e) => (Module._GuiTextBox = wasmExports.Pf)(r, t, n, e), Module._GetCharPressed = () => (Module._GetCharPressed = wasmExports.Qf)(), Module._CodepointToUTF8 = (r, t) => (Module._CodepointToUTF8 = wasmExports.Rf)(r, t), Module._IsKeyPressed = r => (Module._IsKeyPressed = wasmExports.Sf)(r), Module._GetCodepointPrevious = (r, t) => (Module._GetCodepointPrevious = wasmExports.Tf)(r, t), Module._GuiSpinner = (r, t, n, e, a, _) => (Module._GuiSpinner = wasmExports.Uf)(r, t, n, e, a, _), Module._GuiValueBox = (r, t, n, e, a, _) => (Module._GuiValueBox = wasmExports.Vf)(r, t, n, e, a, _), Module._GuiSlider = (r, t, n, e, a, _) => (Module._GuiSlider = wasmExports.Wf)(r, t, n, e, a, _), Module._GuiSliderBar = (r, t, n, e, a, _) => (Module._GuiSliderBar = wasmExports.Xf)(r, t, n, e, a, _), Module._GuiProgressBar = (r, t, n, e, a, _) => (Module._GuiProgressBar = wasmExports.Yf)(r, t, n, e, a, _), Module._GuiDummyRec = (r, t) => (Module._GuiDummyRec = wasmExports.Zf)(r, t), Module._GuiListView = (r, t, n, e) => (Module._GuiListView = wasmExports._f)(r, t, n, e), Module._GuiListViewEx = (r, t, n, e, a, _) => (Module._GuiListViewEx = wasmExports.$f)(r, t, n, e, a, _), Module._GuiColorPanel = (r, t, n) => (Module._GuiColorPanel = wasmExports.ag)(r, t, n), Module._DrawRectangleGradientEx = (r, t, n, e, a) => (Module._DrawRectangleGradientEx = wasmExports.bg)(r, t, n, e, a), Module._GuiColorBarAlpha = (r, t, n) => (Module._GuiColorBarAlpha = wasmExports.cg)(r, t, n), Module._GuiColorBarHue = (r, t, n) => (Module._GuiColorBarHue = wasmExports.dg)(r, t, n), Module._DrawRectangleGradientV = (r, t, n, e, a, _) => (Module._DrawRectangleGradientV = wasmExports.eg)(r, t, n, e, a, _), Module._GuiColorPicker = (r, t, n) => (Module._GuiColorPicker = wasmExports.fg)(r, t, n), Module._GuiColorPickerHSV = (r, t, n) => (Module._GuiColorPickerHSV = wasmExports.gg)(r, t, n), Module._GuiColorPanelHSV = (r, t, n) => (Module._GuiColorPanelHSV = wasmExports.hg)(r, t, n), Module._GuiMessageBox = (r, t, n, e) => (Module._GuiMessageBox = wasmExports.ig)(r, t, n, e), Module._GuiTextInputBox = (r, t, n, e, a, _, u) => (Module._GuiTextInputBox = wasmExports.jg)(r, t, n, e, a, _, u), Module._GuiGrid = (r, t, n, e, a) => (Module._GuiGrid = wasmExports.kg)(r, t, n, e, a), Module._GuiEnableTooltip = () => (Module._GuiEnableTooltip = wasmExports.lg)(), Module._GuiDisableTooltip = () => (Module._GuiDisableTooltip = wasmExports.mg)(), Module._GuiSetTooltip = r => (Module._GuiSetTooltip = wasmExports.ng)(r), Module._GuiLoadStyle = r => (Module._GuiLoadStyle = wasmExports.og)(r), Module._GetDirectoryPath = r => (Module._GetDirectoryPath = wasmExports.pg)(r), Module._LoadFileText = r => (Module._LoadFileText = wasmExports.qg)(r), Module._LoadCodepoints = (r, t) => (Module._LoadCodepoints = wasmExports.rg)(r, t), Module._UnloadFileText = r => (Module._UnloadFileText = wasmExports.sg)(r), Module._LoadFontEx = (r, t, n, e, a) => (Module._LoadFontEx = wasmExports.tg)(r, t, n, e, a), Module._UnloadCodepoints = r => (Module._UnloadCodepoints = wasmExports.ug)(r);
        var _malloc = Module._malloc = r => (_malloc = Module._malloc = wasmExports.vg)(r);
        Module._DecompressData = (r, t, n) => (Module._DecompressData = wasmExports.wg)(r, t, n), Module._LoadTextureFromImage = (r, t) => (Module._LoadTextureFromImage = wasmExports.xg)(r, t), Module._GuiGetIcons = () => (Module._GuiGetIcons = wasmExports.yg)(), Module._GuiLoadIcons = (r, t) => (Module._GuiLoadIcons = wasmExports.zg)(r, t), Module._GuiSetIconScale = r => (Module._GuiSetIconScale = wasmExports.Ag)(r), Module._EaseLinearNone = (r, t, n, e) => (Module._EaseLinearNone = wasmExports.Bg)(r, t, n, e), Module._EaseLinearIn = (r, t, n, e) => (Module._EaseLinearIn = wasmExports.Cg)(r, t, n, e), Module._EaseLinearOut = (r, t, n, e) => (Module._EaseLinearOut = wasmExports.Dg)(r, t, n, e), Module._EaseLinearInOut = (r, t, n, e) => (Module._EaseLinearInOut = wasmExports.Eg)(r, t, n, e), Module._EaseSineIn = (r, t, n, e) => (Module._EaseSineIn = wasmExports.Fg)(r, t, n, e), Module._EaseSineOut = (r, t, n, e) => (Module._EaseSineOut = wasmExports.Gg)(r, t, n, e), Module._EaseSineInOut = (r, t, n, e) => (Module._EaseSineInOut = wasmExports.Hg)(r, t, n, e), Module._EaseCircIn = (r, t, n, e) => (Module._EaseCircIn = wasmExports.Ig)(r, t, n, e), Module._EaseCircOut = (r, t, n, e) => (Module._EaseCircOut = wasmExports.Jg)(r, t, n, e), Module._EaseCircInOut = (r, t, n, e) => (Module._EaseCircInOut = wasmExports.Kg)(r, t, n, e), Module._EaseCubicIn = (r, t, n, e) => (Module._EaseCubicIn = wasmExports.Lg)(r, t, n, e), Module._EaseCubicOut = (r, t, n, e) => (Module._EaseCubicOut = wasmExports.Mg)(r, t, n, e), Module._EaseCubicInOut = (r, t, n, e) => (Module._EaseCubicInOut = wasmExports.Ng)(r, t, n, e), Module._EaseQuadIn = (r, t, n, e) => (Module._EaseQuadIn = wasmExports.Og)(r, t, n, e), Module._EaseQuadOut = (r, t, n, e) => (Module._EaseQuadOut = wasmExports.Pg)(r, t, n, e), Module._EaseQuadInOut = (r, t, n, e) => (Module._EaseQuadInOut = wasmExports.Qg)(r, t, n, e), Module._EaseExpoIn = (r, t, n, e) => (Module._EaseExpoIn = wasmExports.Rg)(r, t, n, e), Module._EaseExpoOut = (r, t, n, e) => (Module._EaseExpoOut = wasmExports.Sg)(r, t, n, e), Module._EaseExpoInOut = (r, t, n, e) => (Module._EaseExpoInOut = wasmExports.Tg)(r, t, n, e), Module._EaseBackIn = (r, t, n, e) => (Module._EaseBackIn = wasmExports.Ug)(r, t, n, e), Module._EaseBackOut = (r, t, n, e) => (Module._EaseBackOut = wasmExports.Vg)(r, t, n, e), Module._EaseBackInOut = (r, t, n, e) => (Module._EaseBackInOut = wasmExports.Wg)(r, t, n, e), Module._EaseBounceOut = (r, t, n, e) => (Module._EaseBounceOut = wasmExports.Xg)(r, t, n, e), Module._EaseBounceIn = (r, t, n, e) => (Module._EaseBounceIn = wasmExports.Yg)(r, t, n, e), Module._EaseBounceInOut = (r, t, n, e) => (Module._EaseBounceInOut = wasmExports.Zg)(r, t, n, e), Module._EaseElasticIn = (r, t, n, e) => (Module._EaseElasticIn = wasmExports._g)(r, t, n, e), Module._EaseElasticOut = (r, t, n, e) => (Module._EaseElasticOut = wasmExports.$g)(r, t, n, e), Module._EaseElasticInOut = (r, t, n, e) => (Module._EaseElasticInOut = wasmExports.ah)(r, t, n, e), Module._DrawTextBoxedSelectable = (r, t, n, e, a, _, u, c, m, M, S) => (Module._DrawTextBoxedSelectable = wasmExports.bh)(r, t, n, e, a, _, u, c, m, M, S), Module._TextLength = r => (Module._TextLength = wasmExports.ch)(r), Module._DrawRectangleRec = (r, t) => (Module._DrawRectangleRec = wasmExports.dh)(r, t), Module._DrawTextBoxed = (r, t, n, e, a, _, u) => (Module._DrawTextBoxed = wasmExports.eh)(r, t, n, e, a, _, u), Module._rlMatrixMode = r => (Module._rlMatrixMode = wasmExports.gh)(r), Module._rlPushMatrix = () => (Module._rlPushMatrix = wasmExports.hh)(), Module._rlPopMatrix = () => (Module._rlPopMatrix = wasmExports.ih)(), Module._rlLoadIdentity = () => (Module._rlLoadIdentity = wasmExports.jh)(), Module._rlTranslatef = (r, t, n) => (Module._rlTranslatef = wasmExports.kh)(r, t, n), Module._rlRotatef = (r, t, n, e) => (Module._rlRotatef = wasmExports.lh)(r, t, n, e), Module._rlScalef = (r, t, n) => (Module._rlScalef = wasmExports.mh)(r, t, n), Module._rlMultMatrixf = r => (Module._rlMultMatrixf = wasmExports.nh)(r), Module._rlFrustum = (r, t, n, e, a, _) => (Module._rlFrustum = wasmExports.oh)(r, t, n, e, a, _), Module._rlOrtho = (r, t, n, e, a, _) => (Module._rlOrtho = wasmExports.ph)(r, t, n, e, a, _), Module._rlViewport = (r, t, n, e) => (Module._rlViewport = wasmExports.qh)(r, t, n, e), Module._rlBegin = r => (Module._rlBegin = wasmExports.rh)(r), Module._rlDrawRenderBatch = r => (Module._rlDrawRenderBatch = wasmExports.sh)(r), Module._rlCheckRenderBatchLimit = r => (Module._rlCheckRenderBatchLimit = wasmExports.th)(r), Module._rlEnd = () => (Module._rlEnd = wasmExports.uh)(), Module._rlVertex3f = (r, t, n) => (Module._rlVertex3f = wasmExports.vh)(r, t, n), Module._rlVertex2f = (r, t) => (Module._rlVertex2f = wasmExports.wh)(r, t), Module._rlVertex2i = (r, t) => (Module._rlVertex2i = wasmExports.xh)(r, t), Module._rlTexCoord2f = (r, t) => (Module._rlTexCoord2f = wasmExports.yh)(r, t), Module._rlNormal3f = (r, t, n) => (Module._rlNormal3f = wasmExports.zh)(r, t, n), Module._rlColor4ub = (r, t, n, e) => (Module._rlColor4ub = wasmExports.Ah)(r, t, n, e), Module._rlColor4f = (r, t, n, e) => (Module._rlColor4f = wasmExports.Bh)(r, t, n, e), Module._rlColor3f = (r, t, n) => (Module._rlColor3f = wasmExports.Ch)(r, t, n), Module._rlSetTexture = r => (Module._rlSetTexture = wasmExports.Dh)(r), Module._rlActiveTextureSlot = r => (Module._rlActiveTextureSlot = wasmExports.Eh)(r), Module._rlEnableTexture = r => (Module._rlEnableTexture = wasmExports.Fh)(r), Module._rlDisableTexture = () => (Module._rlDisableTexture = wasmExports.Gh)(), Module._rlEnableTextureCubemap = r => (Module._rlEnableTextureCubemap = wasmExports.Hh)(r), Module._rlDisableTextureCubemap = () => (Module._rlDisableTextureCubemap = wasmExports.Ih)(), Module._rlTextureParameters = (r, t, n) => (Module._rlTextureParameters = wasmExports.Jh)(r, t, n), Module._rlCubemapParameters = (r, t, n) => (Module._rlCubemapParameters = wasmExports.Kh)(r, t, n), Module._rlEnableShader = r => (Module._rlEnableShader = wasmExports.Lh)(r), Module._rlDisableShader = () => (Module._rlDisableShader = wasmExports.Mh)(), Module._rlEnableFramebuffer = r => (Module._rlEnableFramebuffer = wasmExports.Nh)(r), Module._rlDisableFramebuffer = () => (Module._rlDisableFramebuffer = wasmExports.Oh)(), Module._rlActiveDrawBuffers = r => (Module._rlActiveDrawBuffers = wasmExports.Ph)(r), Module._rlEnableColorBlend = () => (Module._rlEnableColorBlend = wasmExports.Qh)(), Module._rlDisableColorBlend = () => (Module._rlDisableColorBlend = wasmExports.Rh)(), Module._rlEnableDepthTest = () => (Module._rlEnableDepthTest = wasmExports.Sh)(), Module._rlDisableDepthTest = () => (Module._rlDisableDepthTest = wasmExports.Th)(), Module._rlEnableDepthMask = () => (Module._rlEnableDepthMask = wasmExports.Uh)(), Module._rlDisableDepthMask = () => (Module._rlDisableDepthMask = wasmExports.Vh)(), Module._rlEnableBackfaceCulling = () => (Module._rlEnableBackfaceCulling = wasmExports.Wh)(), Module._rlDisableBackfaceCulling = () => (Module._rlDisableBackfaceCulling = wasmExports.Xh)(), Module._rlSetCullFace = r => (Module._rlSetCullFace = wasmExports.Yh)(r), Module._rlEnableScissorTest = () => (Module._rlEnableScissorTest = wasmExports.Zh)(), Module._rlDisableScissorTest = () => (Module._rlDisableScissorTest = wasmExports._h)(), Module._rlScissor = (r, t, n, e) => (Module._rlScissor = wasmExports.$h)(r, t, n, e), Module._rlEnableWireMode = () => (Module._rlEnableWireMode = wasmExports.ai)(), Module._rlDisableWireMode = () => (Module._rlDisableWireMode = wasmExports.bi)(), Module._rlSetLineWidth = r => (Module._rlSetLineWidth = wasmExports.ci)(r), Module._rlGetLineWidth = () => (Module._rlGetLineWidth = wasmExports.di)(), Module._rlEnableSmoothLines = () => (Module._rlEnableSmoothLines = wasmExports.ei)(), Module._rlDisableSmoothLines = () => (Module._rlDisableSmoothLines = wasmExports.fi)(), Module._rlEnableStereoRender = () => (Module._rlEnableStereoRender = wasmExports.gi)(), Module._rlDisableStereoRender = () => (Module._rlDisableStereoRender = wasmExports.hi)(), Module._rlIsStereoRenderEnabled = () => (Module._rlIsStereoRenderEnabled = wasmExports.ii)(), Module._rlClearColor = (r, t, n, e) => (Module._rlClearColor = wasmExports.ji)(r, t, n, e), Module._rlClearScreenBuffers = () => (Module._rlClearScreenBuffers = wasmExports.ki)(), Module._rlCheckErrors = () => (Module._rlCheckErrors = wasmExports.li)(), Module._rlSetBlendMode = r => (Module._rlSetBlendMode = wasmExports.mi)(r), Module._rlSetBlendFactors = (r, t, n) => (Module._rlSetBlendFactors = wasmExports.ni)(r, t, n), Module._rlSetBlendFactorsSeparate = (r, t, n, e, a, _) => (Module._rlSetBlendFactorsSeparate = wasmExports.oi)(r, t, n, e, a, _), Module._rlglInit = (r, t) => (Module._rlglInit = wasmExports.pi)(r, t), Module._rlLoadTexture = (r, t, n, e, a) => (Module._rlLoadTexture = wasmExports.qi)(r, t, n, e, a), Module._rlCompileShader = (r, t) => (Module._rlCompileShader = wasmExports.ri)(r, t), Module._rlLoadShaderProgram = (r, t) => (Module._rlLoadShaderProgram = wasmExports.si)(r, t), Module._rlLoadRenderBatch = (r, t, n) => (Module._rlLoadRenderBatch = wasmExports.ti)(r, t, n), Module._rlGetGlTextureFormats = (r, t, n, e) => (Module._rlGetGlTextureFormats = wasmExports.ui)(r, t, n, e), Module._rlGetPixelFormatName = r => (Module._rlGetPixelFormatName = wasmExports.vi)(r), Module._rlglClose = () => (Module._rlglClose = wasmExports.wi)(), Module._rlUnloadRenderBatch = r => (Module._rlUnloadRenderBatch = wasmExports.xi)(r), Module._rlLoadExtensions = r => (Module._rlLoadExtensions = wasmExports.yi)(r), Module._rlGetVersion = () => (Module._rlGetVersion = wasmExports.zi)(), Module._rlSetFramebufferWidth = r => (Module._rlSetFramebufferWidth = wasmExports.Ai)(r), Module._rlSetFramebufferHeight = r => (Module._rlSetFramebufferHeight = wasmExports.Bi)(r), Module._rlGetFramebufferWidth = () => (Module._rlGetFramebufferWidth = wasmExports.Ci)(), Module._rlGetFramebufferHeight = () => (Module._rlGetFramebufferHeight = wasmExports.Di)(), Module._rlGetTextureIdDefault = () => (Module._rlGetTextureIdDefault = wasmExports.Ei)(), Module._rlGetShaderIdDefault = () => (Module._rlGetShaderIdDefault = wasmExports.Fi)(), Module._rlGetShaderLocsDefault = () => (Module._rlGetShaderLocsDefault = wasmExports.Gi)(), Module._rlSetMatrixModelview = r => (Module._rlSetMatrixModelview = wasmExports.Hi)(r), Module._rlSetMatrixProjection = r => (Module._rlSetMatrixProjection = wasmExports.Ii)(r), Module._rlSetRenderBatchActive = r => (Module._rlSetRenderBatchActive = wasmExports.Ji)(r), Module._rlDrawRenderBatchActive = () => (Module._rlDrawRenderBatchActive = wasmExports.Ki)(), Module._rlLoadTextureDepth = (r, t, n) => (Module._rlLoadTextureDepth = wasmExports.Li)(r, t, n), Module._rlLoadTextureCubemap = (r, t, n) => (Module._rlLoadTextureCubemap = wasmExports.Mi)(r, t, n), Module._rlUpdateTexture = (r, t, n, e, a, _, u) => (Module._rlUpdateTexture = wasmExports.Ni)(r, t, n, e, a, _, u), Module._rlUnloadTexture = r => (Module._rlUnloadTexture = wasmExports.Oi)(r), Module._rlGenTextureMipmaps = (r, t, n, e, a) => (Module._rlGenTextureMipmaps = wasmExports.Pi)(r, t, n, e, a), Module._rlReadTexturePixels = (r, t, n, e) => (Module._rlReadTexturePixels = wasmExports.Qi)(r, t, n, e), Module._rlUnloadFramebuffer = r => (Module._rlUnloadFramebuffer = wasmExports.Ri)(r), Module._rlLoadFramebuffer = (r, t) => (Module._rlLoadFramebuffer = wasmExports.Si)(r, t), Module._rlReadScreenPixels = (r, t) => (Module._rlReadScreenPixels = wasmExports.Ti)(r, t), Module._rlFramebufferAttach = (r, t, n, e, a) => (Module._rlFramebufferAttach = wasmExports.Ui)(r, t, n, e, a), Module._rlFramebufferComplete = r => (Module._rlFramebufferComplete = wasmExports.Vi)(r), Module._rlLoadVertexBuffer = (r, t, n) => (Module._rlLoadVertexBuffer = wasmExports.Wi)(r, t, n), Module._rlLoadVertexBufferElement = (r, t, n) => (Module._rlLoadVertexBufferElement = wasmExports.Xi)(r, t, n), Module._rlEnableVertexBuffer = r => (Module._rlEnableVertexBuffer = wasmExports.Yi)(r), Module._rlDisableVertexBuffer = () => (Module._rlDisableVertexBuffer = wasmExports.Zi)(), Module._rlEnableVertexBufferElement = r => (Module._rlEnableVertexBufferElement = wasmExports._i)(r), Module._rlDisableVertexBufferElement = () => (Module._rlDisableVertexBufferElement = wasmExports.$i)(), Module._rlUpdateVertexBuffer = (r, t, n, e) => (Module._rlUpdateVertexBuffer = wasmExports.aj)(r, t, n, e), Module._rlUpdateVertexBufferElements = (r, t, n, e) => (Module._rlUpdateVertexBufferElements = wasmExports.bj)(r, t, n, e), Module._rlEnableVertexArray = r => (Module._rlEnableVertexArray = wasmExports.cj)(r), Module._rlDisableVertexArray = () => (Module._rlDisableVertexArray = wasmExports.dj)(), Module._rlEnableVertexAttribute = r => (Module._rlEnableVertexAttribute = wasmExports.ej)(r), Module._rlDisableVertexAttribute = r => (Module._rlDisableVertexAttribute = wasmExports.fj)(r), Module._rlDrawVertexArray = (r, t) => (Module._rlDrawVertexArray = wasmExports.gj)(r, t), Module._rlDrawVertexArrayElements = (r, t, n) => (Module._rlDrawVertexArrayElements = wasmExports.hj)(r, t, n), Module._rlDrawVertexArrayInstanced = (r, t, n) => (Module._rlDrawVertexArrayInstanced = wasmExports.ij)(r, t, n), Module._rlDrawVertexArrayElementsInstanced = (r, t, n, e) => (Module._rlDrawVertexArrayElementsInstanced = wasmExports.jj)(r, t, n, e), Module._rlLoadVertexArray = () => (Module._rlLoadVertexArray = wasmExports.kj)(), Module._rlSetVertexAttribute = (r, t, n, e, a, _) => (Module._rlSetVertexAttribute = wasmExports.lj)(r, t, n, e, a, _), Module._rlSetVertexAttributeDivisor = (r, t) => (Module._rlSetVertexAttributeDivisor = wasmExports.mj)(r, t), Module._rlUnloadVertexArray = r => (Module._rlUnloadVertexArray = wasmExports.nj)(r), Module._rlUnloadVertexBuffer = r => (Module._rlUnloadVertexBuffer = wasmExports.oj)(r), Module._rlLoadShaderCode = (r, t) => (Module._rlLoadShaderCode = wasmExports.pj)(r, t), Module._rlUnloadShaderProgram = r => (Module._rlUnloadShaderProgram = wasmExports.qj)(r), Module._rlGetLocationUniform = (r, t) => (Module._rlGetLocationUniform = wasmExports.rj)(r, t), Module._rlGetLocationAttrib = (r, t) => (Module._rlGetLocationAttrib = wasmExports.sj)(r, t), Module._rlSetUniform = (r, t, n, e) => (Module._rlSetUniform = wasmExports.tj)(r, t, n, e), Module._rlSetVertexAttributeDefault = (r, t, n, e) => (Module._rlSetVertexAttributeDefault = wasmExports.uj)(r, t, n, e), Module._rlSetUniformMatrix = (r, t) => (Module._rlSetUniformMatrix = wasmExports.vj)(r, t), Module._rlSetUniformSampler = (r, t) => (Module._rlSetUniformSampler = wasmExports.wj)(r, t), Module._rlSetShader = (r, t) => (Module._rlSetShader = wasmExports.xj)(r, t), Module._rlLoadComputeShaderProgram = r => (Module._rlLoadComputeShaderProgram = wasmExports.yj)(r), Module._rlComputeShaderDispatch = (r, t, n) => (Module._rlComputeShaderDispatch = wasmExports.zj)(r, t, n), Module._rlLoadShaderBuffer = (r, t, n) => (Module._rlLoadShaderBuffer = wasmExports.Aj)(r, t, n), Module._rlUnloadShaderBuffer = r => (Module._rlUnloadShaderBuffer = wasmExports.Bj)(r), Module._rlUpdateShaderBuffer = (r, t, n, e) => (Module._rlUpdateShaderBuffer = wasmExports.Cj)(r, t, n, e), Module._rlGetShaderBufferSize = r => (Module._rlGetShaderBufferSize = wasmExports.Dj)(r), Module._rlReadShaderBuffer = (r, t, n, e) => (Module._rlReadShaderBuffer = wasmExports.Ej)(r, t, n, e), Module._rlBindShaderBuffer = (r, t) => (Module._rlBindShaderBuffer = wasmExports.Fj)(r, t), Module._rlCopyShaderBuffer = (r, t, n, e, a) => (Module._rlCopyShaderBuffer = wasmExports.Gj)(r, t, n, e, a), Module._rlBindImageTexture = (r, t, n, e) => (Module._rlBindImageTexture = wasmExports.Hj)(r, t, n, e), Module._rlGetMatrixModelview = r => (Module._rlGetMatrixModelview = wasmExports.Ij)(r), Module._rlGetMatrixProjection = r => (Module._rlGetMatrixProjection = wasmExports.Jj)(r), Module._rlGetMatrixTransform = r => (Module._rlGetMatrixTransform = wasmExports.Kj)(r), Module._rlGetMatrixProjectionStereo = (r, t) => (Module._rlGetMatrixProjectionStereo = wasmExports.Lj)(r, t), Module._rlGetMatrixViewOffsetStereo = (r, t) => (Module._rlGetMatrixViewOffsetStereo = wasmExports.Mj)(r, t), Module._rlSetMatrixProjectionStereo = (r, t) => (Module._rlSetMatrixProjectionStereo = wasmExports.Nj)(r, t), Module._rlSetMatrixViewOffsetStereo = (r, t) => (Module._rlSetMatrixViewOffsetStereo = wasmExports.Oj)(r, t), Module._rlLoadDrawQuad = () => (Module._rlLoadDrawQuad = wasmExports.Pj)(), Module._rlLoadDrawCube = () => (Module._rlLoadDrawCube = wasmExports.Qj)(), Module._Clamp = (r, t, n) => (Module._Clamp = wasmExports.Rj)(r, t, n), Module._Lerp = (r, t, n) => (Module._Lerp = wasmExports.Sj)(r, t, n), Module._Normalize = (r, t, n) => (Module._Normalize = wasmExports.Tj)(r, t, n), Module._Remap = (r, t, n, e, a) => (Module._Remap = wasmExports.Uj)(r, t, n, e, a), Module._Wrap = (r, t, n) => (Module._Wrap = wasmExports.Vj)(r, t, n), Module._FloatEquals = (r, t) => (Module._FloatEquals = wasmExports.Wj)(r, t), Module._Vector2Zero = r => (Module._Vector2Zero = wasmExports.Xj)(r), Module._Vector2One = r => (Module._Vector2One = wasmExports.Yj)(r), Module._Vector2Add = (r, t, n) => (Module._Vector2Add = wasmExports.Zj)(r, t, n), Module._Vector2AddValue = (r, t, n) => (Module._Vector2AddValue = wasmExports._j)(r, t, n), Module._Vector2Subtract = (r, t, n) => (Module._Vector2Subtract = wasmExports.$j)(r, t, n), Module._Vector2SubtractValue = (r, t, n) => (Module._Vector2SubtractValue = wasmExports.ak)(r, t, n), Module._Vector2Length = r => (Module._Vector2Length = wasmExports.bk)(r), Module._Vector2LengthSqr = r => (Module._Vector2LengthSqr = wasmExports.ck)(r), Module._Vector2DotProduct = (r, t) => (Module._Vector2DotProduct = wasmExports.dk)(r, t), Module._Vector2Distance = (r, t) => (Module._Vector2Distance = wasmExports.ek)(r, t), Module._Vector2DistanceSqr = (r, t) => (Module._Vector2DistanceSqr = wasmExports.fk)(r, t), Module._Vector2Angle = (r, t) => (Module._Vector2Angle = wasmExports.gk)(r, t), Module._Vector2LineAngle = (r, t) => (Module._Vector2LineAngle = wasmExports.hk)(r, t), Module._Vector2Scale = (r, t, n) => (Module._Vector2Scale = wasmExports.ik)(r, t, n), Module._Vector2Multiply = (r, t, n) => (Module._Vector2Multiply = wasmExports.jk)(r, t, n), Module._Vector2Negate = (r, t) => (Module._Vector2Negate = wasmExports.kk)(r, t), Module._Vector2Divide = (r, t, n) => (Module._Vector2Divide = wasmExports.lk)(r, t, n), Module._Vector2Normalize = (r, t) => (Module._Vector2Normalize = wasmExports.mk)(r, t), Module._Vector2Transform = (r, t, n) => (Module._Vector2Transform = wasmExports.nk)(r, t, n), Module._Vector2Lerp = (r, t, n, e) => (Module._Vector2Lerp = wasmExports.ok)(r, t, n, e), Module._Vector2Reflect = (r, t, n) => (Module._Vector2Reflect = wasmExports.pk)(r, t, n), Module._Vector2Rotate = (r, t, n) => (Module._Vector2Rotate = wasmExports.qk)(r, t, n), Module._Vector2MoveTowards = (r, t, n, e) => (Module._Vector2MoveTowards = wasmExports.rk)(r, t, n, e), Module._Vector2Invert = (r, t) => (Module._Vector2Invert = wasmExports.sk)(r, t), Module._Vector2Clamp = (r, t, n, e) => (Module._Vector2Clamp = wasmExports.tk)(r, t, n, e), Module._Vector2ClampValue = (r, t, n, e) => (Module._Vector2ClampValue = wasmExports.uk)(r, t, n, e), Module._Vector2Equals = (r, t) => (Module._Vector2Equals = wasmExports.vk)(r, t), Module._Vector3Zero = r => (Module._Vector3Zero = wasmExports.wk)(r), Module._Vector3One = r => (Module._Vector3One = wasmExports.xk)(r), Module._Vector3Add = (r, t, n) => (Module._Vector3Add = wasmExports.yk)(r, t, n), Module._Vector3AddValue = (r, t, n) => (Module._Vector3AddValue = wasmExports.zk)(r, t, n), Module._Vector3Subtract = (r, t, n) => (Module._Vector3Subtract = wasmExports.Ak)(r, t, n), Module._Vector3SubtractValue = (r, t, n) => (Module._Vector3SubtractValue = wasmExports.Bk)(r, t, n), Module._Vector3Scale = (r, t, n) => (Module._Vector3Scale = wasmExports.Ck)(r, t, n), Module._Vector3Multiply = (r, t, n) => (Module._Vector3Multiply = wasmExports.Dk)(r, t, n), Module._Vector3CrossProduct = (r, t, n) => (Module._Vector3CrossProduct = wasmExports.Ek)(r, t, n), Module._Vector3Perpendicular = (r, t) => (Module._Vector3Perpendicular = wasmExports.Fk)(r, t), Module._Vector3Length = r => (Module._Vector3Length = wasmExports.Gk)(r), Module._Vector3LengthSqr = r => (Module._Vector3LengthSqr = wasmExports.Hk)(r), Module._Vector3DotProduct = (r, t) => (Module._Vector3DotProduct = wasmExports.Ik)(r, t), Module._Vector3Distance = (r, t) => (Module._Vector3Distance = wasmExports.Jk)(r, t), Module._Vector3DistanceSqr = (r, t) => (Module._Vector3DistanceSqr = wasmExports.Kk)(r, t), Module._Vector3Angle = (r, t) => (Module._Vector3Angle = wasmExports.Lk)(r, t), Module._Vector3Negate = (r, t) => (Module._Vector3Negate = wasmExports.Mk)(r, t), Module._Vector3Divide = (r, t, n) => (Module._Vector3Divide = wasmExports.Nk)(r, t, n), Module._Vector3Normalize = (r, t) => (Module._Vector3Normalize = wasmExports.Ok)(r, t), Module._Vector3Project = (r, t, n) => (Module._Vector3Project = wasmExports.Pk)(r, t, n), Module._Vector3Reject = (r, t, n) => (Module._Vector3Reject = wasmExports.Qk)(r, t, n), Module._Vector3OrthoNormalize = (r, t) => (Module._Vector3OrthoNormalize = wasmExports.Rk)(r, t), Module._Vector3Transform = (r, t, n) => (Module._Vector3Transform = wasmExports.Sk)(r, t, n), Module._Vector3RotateByQuaternion = (r, t, n) => (Module._Vector3RotateByQuaternion = wasmExports.Tk)(r, t, n), Module._Vector3RotateByAxisAngle = (r, t, n, e) => (Module._Vector3RotateByAxisAngle = wasmExports.Uk)(r, t, n, e), Module._Vector3Lerp = (r, t, n, e) => (Module._Vector3Lerp = wasmExports.Vk)(r, t, n, e), Module._Vector3Reflect = (r, t, n) => (Module._Vector3Reflect = wasmExports.Wk)(r, t, n), Module._Vector3Min = (r, t, n) => (Module._Vector3Min = wasmExports.Xk)(r, t, n), Module._Vector3Max = (r, t, n) => (Module._Vector3Max = wasmExports.Yk)(r, t, n), Module._Vector3Barycenter = (r, t, n, e, a) => (Module._Vector3Barycenter = wasmExports.Zk)(r, t, n, e, a), Module._Vector3Unproject = (r, t, n, e) => (Module._Vector3Unproject = wasmExports._k)(r, t, n, e), Module._Vector3ToFloatV = (r, t) => (Module._Vector3ToFloatV = wasmExports.$k)(r, t), Module._Vector3Invert = (r, t) => (Module._Vector3Invert = wasmExports.al)(r, t), Module._Vector3Clamp = (r, t, n, e) => (Module._Vector3Clamp = wasmExports.bl)(r, t, n, e), Module._Vector3ClampValue = (r, t, n, e) => (Module._Vector3ClampValue = wasmExports.cl)(r, t, n, e), Module._Vector3Equals = (r, t) => (Module._Vector3Equals = wasmExports.dl)(r, t), Module._Vector3Refract = (r, t, n, e) => (Module._Vector3Refract = wasmExports.el)(r, t, n, e), Module._MatrixDeterminant = r => (Module._MatrixDeterminant = wasmExports.fl)(r), Module._MatrixTrace = r => (Module._MatrixTrace = wasmExports.gl)(r), Module._MatrixTranspose = (r, t) => (Module._MatrixTranspose = wasmExports.hl)(r, t), Module._MatrixInvert = (r, t) => (Module._MatrixInvert = wasmExports.il)(r, t), Module._MatrixIdentity = r => (Module._MatrixIdentity = wasmExports.jl)(r), Module._MatrixAdd = (r, t, n) => (Module._MatrixAdd = wasmExports.kl)(r, t, n), Module._MatrixSubtract = (r, t, n) => (Module._MatrixSubtract = wasmExports.ll)(r, t, n), Module._MatrixMultiply = (r, t, n) => (Module._MatrixMultiply = wasmExports.ml)(r, t, n), Module._MatrixTranslate = (r, t, n, e) => (Module._MatrixTranslate = wasmExports.nl)(r, t, n, e), Module._MatrixRotate = (r, t, n) => (Module._MatrixRotate = wasmExports.ol)(r, t, n), Module._MatrixRotateX = (r, t) => (Module._MatrixRotateX = wasmExports.pl)(r, t), Module._MatrixRotateY = (r, t) => (Module._MatrixRotateY = wasmExports.ql)(r, t), Module._MatrixRotateZ = (r, t) => (Module._MatrixRotateZ = wasmExports.rl)(r, t), Module._MatrixRotateXYZ = (r, t) => (Module._MatrixRotateXYZ = wasmExports.sl)(r, t), Module._MatrixRotateZYX = (r, t) => (Module._MatrixRotateZYX = wasmExports.tl)(r, t), Module._MatrixScale = (r, t, n, e) => (Module._MatrixScale = wasmExports.ul)(r, t, n, e), Module._MatrixFrustum = (r, t, n, e, a, _, u) => (Module._MatrixFrustum = wasmExports.vl)(r, t, n, e, a, _, u), Module._MatrixPerspective = (r, t, n, e, a) => (Module._MatrixPerspective = wasmExports.wl)(r, t, n, e, a), Module._MatrixOrtho = (r, t, n, e, a, _, u) => (Module._MatrixOrtho = wasmExports.xl)(r, t, n, e, a, _, u), Module._MatrixLookAt = (r, t, n, e) => (Module._MatrixLookAt = wasmExports.yl)(r, t, n, e), Module._MatrixToFloatV = (r, t) => (Module._MatrixToFloatV = wasmExports.zl)(r, t), Module._QuaternionAdd = (r, t, n) => (Module._QuaternionAdd = wasmExports.Al)(r, t, n), Module._QuaternionAddValue = (r, t, n) => (Module._QuaternionAddValue = wasmExports.Bl)(r, t, n), Module._QuaternionSubtract = (r, t, n) => (Module._QuaternionSubtract = wasmExports.Cl)(r, t, n), Module._QuaternionSubtractValue = (r, t, n) => (Module._QuaternionSubtractValue = wasmExports.Dl)(r, t, n), Module._QuaternionIdentity = r => (Module._QuaternionIdentity = wasmExports.El)(r), Module._QuaternionLength = r => (Module._QuaternionLength = wasmExports.Fl)(r), Module._QuaternionNormalize = (r, t) => (Module._QuaternionNormalize = wasmExports.Gl)(r, t), Module._QuaternionInvert = (r, t) => (Module._QuaternionInvert = wasmExports.Hl)(r, t), Module._QuaternionMultiply = (r, t, n) => (Module._QuaternionMultiply = wasmExports.Il)(r, t, n), Module._QuaternionScale = (r, t, n) => (Module._QuaternionScale = wasmExports.Jl)(r, t, n), Module._QuaternionDivide = (r, t, n) => (Module._QuaternionDivide = wasmExports.Kl)(r, t, n), Module._QuaternionLerp = (r, t, n, e) => (Module._QuaternionLerp = wasmExports.Ll)(r, t, n, e), Module._QuaternionNlerp = (r, t, n, e) => (Module._QuaternionNlerp = wasmExports.Ml)(r, t, n, e), Module._QuaternionSlerp = (r, t, n, e) => (Module._QuaternionSlerp = wasmExports.Nl)(r, t, n, e), Module._QuaternionFromVector3ToVector3 = (r, t, n) => (Module._QuaternionFromVector3ToVector3 = wasmExports.Ol)(r, t, n), Module._QuaternionFromMatrix = (r, t) => (Module._QuaternionFromMatrix = wasmExports.Pl)(r, t), Module._QuaternionToMatrix = (r, t) => (Module._QuaternionToMatrix = wasmExports.Ql)(r, t), Module._QuaternionFromAxisAngle = (r, t, n) => (Module._QuaternionFromAxisAngle = wasmExports.Rl)(r, t, n), Module._QuaternionToAxisAngle = (r, t, n) => (Module._QuaternionToAxisAngle = wasmExports.Sl)(r, t, n), Module._QuaternionFromEuler = (r, t, n, e) => (Module._QuaternionFromEuler = wasmExports.Tl)(r, t, n, e), Module._QuaternionToEuler = (r, t) => (Module._QuaternionToEuler = wasmExports.Ul)(r, t), Module._QuaternionTransform = (r, t, n) => (Module._QuaternionTransform = wasmExports.Vl)(r, t, n), Module._QuaternionEquals = (r, t) => (Module._QuaternionEquals = wasmExports.Wl)(r, t), Module._SetGesturesEnabled = r => (Module._SetGesturesEnabled = wasmExports.Xl)(r), Module._IsGestureDetected = r => (Module._IsGestureDetected = wasmExports.Yl)(r), Module._GetGestureDetected = () => (Module._GetGestureDetected = wasmExports.Zl)(), Module._GetGestureHoldDuration = () => (Module._GetGestureHoldDuration = wasmExports._l)(), Module._GetGestureDragVector = r => (Module._GetGestureDragVector = wasmExports.$l)(r), Module._GetGestureDragAngle = () => (Module._GetGestureDragAngle = wasmExports.am)(), Module._GetGesturePinchVector = r => (Module._GetGesturePinchVector = wasmExports.bm)(r), Module._GetGesturePinchAngle = () => (Module._GetGesturePinchAngle = wasmExports.cm)(), Module._GetCameraForward = (r, t) => (Module._GetCameraForward = wasmExports.dm)(r, t), Module._GetCameraUp = (r, t) => (Module._GetCameraUp = wasmExports.em)(r, t), Module._GetCameraRight = (r, t) => (Module._GetCameraRight = wasmExports.fm)(r, t), Module._CameraMoveForward = (r, t, n) => (Module._CameraMoveForward = wasmExports.gm)(r, t, n), Module._CameraMoveUp = (r, t) => (Module._CameraMoveUp = wasmExports.hm)(r, t), Module._CameraMoveRight = (r, t, n) => (Module._CameraMoveRight = wasmExports.im)(r, t, n), Module._CameraMoveToTarget = (r, t) => (Module._CameraMoveToTarget = wasmExports.jm)(r, t), Module._CameraYaw = (r, t, n) => (Module._CameraYaw = wasmExports.km)(r, t, n), Module._CameraPitch = (r, t, n, e, a) => (Module._CameraPitch = wasmExports.lm)(r, t, n, e, a), Module._CameraRoll = (r, t) => (Module._CameraRoll = wasmExports.mm)(r, t), Module._GetCameraViewMatrix = (r, t) => (Module._GetCameraViewMatrix = wasmExports.nm)(r, t), Module._GetCameraProjectionMatrix = (r, t, n) => (Module._GetCameraProjectionMatrix = wasmExports.om)(r, t, n), Module._UpdateCamera = (r, t) => (Module._UpdateCamera = wasmExports.pm)(r, t), Module._GetMouseDelta = r => (Module._GetMouseDelta = wasmExports.qm)(r), Module._GetFrameTime = () => (Module._GetFrameTime = wasmExports.rm)(), Module._TraceLog = (r, t, n) => (Module._TraceLog = wasmExports.sm)(r, t, n), Module._IsGamepadAvailable = r => (Module._IsGamepadAvailable = wasmExports.tm)(r), Module._GetGamepadAxisMovement = (r, t) => (Module._GetGamepadAxisMovement = wasmExports.um)(r, t), Module._UpdateCameraPro = (r, t, n, e) => (Module._UpdateCameraPro = wasmExports.vm)(r, t, n, e), Module._InitWindow = (r, t, n) => (Module._InitWindow = wasmExports.wm)(r, t, n), Module._GetMonitorWidth = r => (Module._GetMonitorWidth = wasmExports.xm)(r), Module._GetCurrentMonitor = () => (Module._GetCurrentMonitor = wasmExports.ym)(), Module._GetMonitorHeight = r => (Module._GetMonitorHeight = wasmExports.zm)(r), Module._GetWorkingDirectory = () => (Module._GetWorkingDirectory = wasmExports.Am)(), Module._CloseWindow = () => (Module._CloseWindow = wasmExports.Bm)(), Module._WindowShouldClose = () => (Module._WindowShouldClose = wasmExports.Cm)(), Module._IsWindowReady = () => (Module._IsWindowReady = wasmExports.Dm)(), Module._IsWindowFullscreen = () => (Module._IsWindowFullscreen = wasmExports.Em)(), Module._IsWindowResized = () => (Module._IsWindowResized = wasmExports.Fm)(), Module._IsWindowState = r => (Module._IsWindowState = wasmExports.Gm)(r), Module._ClearWindowState = r => (Module._ClearWindowState = wasmExports.Hm)(r), Module._SetWindowMonitor = r => (Module._SetWindowMonitor = wasmExports.Im)(r), Module._SetWindowMinSize = (r, t) => (Module._SetWindowMinSize = wasmExports.Jm)(r, t), Module._SetWindowMaxSize = (r, t) => (Module._SetWindowMaxSize = wasmExports.Km)(r, t), Module._SetWindowSize = (r, t) => (Module._SetWindowSize = wasmExports.Lm)(r, t), Module._GetScreenHeight = () => (Module._GetScreenHeight = wasmExports.Mm)(), Module._GetRenderWidth = () => (Module._GetRenderWidth = wasmExports.Nm)(), Module._GetRenderHeight = () => (Module._GetRenderHeight = wasmExports.Om)(), Module._GetWindowHandle = () => (Module._GetWindowHandle = wasmExports.Pm)(), Module._GetMonitorCount = () => (Module._GetMonitorCount = wasmExports.Qm)(), Module._GetMonitorPosition = (r, t) => (Module._GetMonitorPosition = wasmExports.Rm)(r, t), Module._GetMonitorPhysicalWidth = r => (Module._GetMonitorPhysicalWidth = wasmExports.Sm)(r), Module._GetMonitorPhysicalHeight = r => (Module._GetMonitorPhysicalHeight = wasmExports.Tm)(r), Module._GetMonitorRefreshRate = r => (Module._GetMonitorRefreshRate = wasmExports.Um)(r), Module._GetWindowPosition = r => (Module._GetWindowPosition = wasmExports.Vm)(r), Module._GetWindowScaleDPI = r => (Module._GetWindowScaleDPI = wasmExports.Wm)(r), Module._GetMonitorName = r => (Module._GetMonitorName = wasmExports.Xm)(r), Module._SetClipboardText = r => (Module._SetClipboardText = wasmExports.Ym)(r), Module._GetClipboardText = () => (Module._GetClipboardText = wasmExports.Zm)(), Module._EnableEventWaiting = () => (Module._EnableEventWaiting = wasmExports._m)(), Module._DisableEventWaiting = () => (Module._DisableEventWaiting = wasmExports.$m)(), Module._ShowCursor = () => (Module._ShowCursor = wasmExports.an)(), Module._HideCursor = () => (Module._HideCursor = wasmExports.bn)(), Module._IsCursorHidden = () => (Module._IsCursorHidden = wasmExports.cn)(), Module._EnableCursor = () => (Module._EnableCursor = wasmExports.dn)(), Module._SetMousePosition = (r, t) => (Module._SetMousePosition = wasmExports.en)(r, t), Module._DisableCursor = () => (Module._DisableCursor = wasmExports.fn)(), Module._IsCursorOnScreen = () => (Module._IsCursorOnScreen = wasmExports.gn)(), Module._ClearBackground = r => (Module._ClearBackground = wasmExports.hn)(r), Module._BeginDrawing = () => (Module._BeginDrawing = wasmExports.jn)(), Module._GetTime = () => (Module._GetTime = wasmExports.kn)(), Module._EndDrawing = () => (Module._EndDrawing = wasmExports.ln)(), Module._DrawCircle = (r, t, n, e) => (Module._DrawCircle = wasmExports.mn)(r, t, n, e), Module._DrawText = (r, t, n, e, a) => (Module._DrawText = wasmExports.nn)(r, t, n, e, a), Module._PollInputEvents = () => (Module._PollInputEvents = wasmExports.on)(), Module._SwapScreenBuffer = () => (Module._SwapScreenBuffer = wasmExports.pn)(), Module._WaitTime = r => (Module._WaitTime = wasmExports.qn)(r), Module._BeginMode2D = r => (Module._BeginMode2D = wasmExports.rn)(r), Module._GetCameraMatrix2D = (r, t) => (Module._GetCameraMatrix2D = wasmExports.sn)(r, t), Module._EndMode2D = () => (Module._EndMode2D = wasmExports.tn)(), Module._BeginMode3D = r => (Module._BeginMode3D = wasmExports.un)(r), Module._EndMode3D = () => (Module._EndMode3D = wasmExports.vn)(), Module._BeginTextureMode = r => (Module._BeginTextureMode = wasmExports.wn)(r), Module._EndTextureMode = () => (Module._EndTextureMode = wasmExports.xn)(), Module._BeginShaderMode = r => (Module._BeginShaderMode = wasmExports.yn)(r), Module._EndShaderMode = () => (Module._EndShaderMode = wasmExports.zn)(), Module._BeginBlendMode = r => (Module._BeginBlendMode = wasmExports.An)(r), Module._EndBlendMode = () => (Module._EndBlendMode = wasmExports.Bn)(), Module._BeginScissorMode = (r, t, n, e) => (Module._BeginScissorMode = wasmExports.Cn)(r, t, n, e), Module._EndScissorMode = () => (Module._EndScissorMode = wasmExports.Dn)(), Module._BeginVrStereoMode = r => (Module._BeginVrStereoMode = wasmExports.En)(r), Module._EndVrStereoMode = () => (Module._EndVrStereoMode = wasmExports.Fn)(), Module._LoadVrStereoConfig = (r, t) => (Module._LoadVrStereoConfig = wasmExports.Gn)(r, t), Module._UnloadVrStereoConfig = r => (Module._UnloadVrStereoConfig = wasmExports.Hn)(r), Module._LoadShader = (r, t, n) => (Module._LoadShader = wasmExports.In)(r, t, n), Module._LoadShaderFromMemory = (r, t, n) => (Module._LoadShaderFromMemory = wasmExports.Jn)(r, t, n), Module._IsShaderReady = r => (Module._IsShaderReady = wasmExports.Kn)(r), Module._UnloadShader = r => (Module._UnloadShader = wasmExports.Ln)(r), Module._GetShaderLocation = (r, t) => (Module._GetShaderLocation = wasmExports.Mn)(r, t), Module._GetShaderLocationAttrib = (r, t) => (Module._GetShaderLocationAttrib = wasmExports.Nn)(r, t), Module._SetShaderValue = (r, t, n, e) => (Module._SetShaderValue = wasmExports.On)(r, t, n, e), Module._SetShaderValueV = (r, t, n, e, a) => (Module._SetShaderValueV = wasmExports.Pn)(r, t, n, e, a), Module._SetShaderValueMatrix = (r, t, n) => (Module._SetShaderValueMatrix = wasmExports.Qn)(r, t, n), Module._SetShaderValueTexture = (r, t, n) => (Module._SetShaderValueTexture = wasmExports.Rn)(r, t, n), Module._GetMouseRay = (r, t, n) => (Module._GetMouseRay = wasmExports.Sn)(r, t, n), Module._GetCameraMatrix = (r, t) => (Module._GetCameraMatrix = wasmExports.Tn)(r, t), Module._GetWorldToScreen = (r, t, n) => (Module._GetWorldToScreen = wasmExports.Un)(r, t, n), Module._GetWorldToScreenEx = (r, t, n, e, a) => (Module._GetWorldToScreenEx = wasmExports.Vn)(r, t, n, e, a), Module._GetWorldToScreen2D = (r, t, n) => (Module._GetWorldToScreen2D = wasmExports.Wn)(r, t, n), Module._GetScreenToWorld2D = (r, t, n) => (Module._GetScreenToWorld2D = wasmExports.Xn)(r, t, n), Module._SetTargetFPS = r => (Module._SetTargetFPS = wasmExports.Yn)(r), Module._GetFPS = () => (Module._GetFPS = wasmExports.Zn)(), Module._SetConfigFlags = r => (Module._SetConfigFlags = wasmExports._n)(r), Module._TakeScreenshot = r => (Module._TakeScreenshot = wasmExports.$n)(r), Module._ExportImage = (r, t) => (Module._ExportImage = wasmExports.ao)(r, t), Module._GetFileName = r => (Module._GetFileName = wasmExports.bo)(r), Module._GetRandomValue = (r, t) => (Module._GetRandomValue = wasmExports.co)(r, t), Module._SetRandomSeed = r => (Module._SetRandomSeed = wasmExports.eo)(r), Module._FileExists = r => (Module._FileExists = wasmExports.fo)(r), Module._IsFileExtension = (r, t) => (Module._IsFileExtension = wasmExports.go)(r, t), Module._TextSplit = (r, t, n) => (Module._TextSplit = wasmExports.ho)(r, t, n), Module._TextToLower = r => (Module._TextToLower = wasmExports.io)(r), Module._GetFileExtension = r => (Module._GetFileExtension = wasmExports.jo)(r), Module._DirectoryExists = r => (Module._DirectoryExists = wasmExports.ko)(r), Module._GetFileLength = r => (Module._GetFileLength = wasmExports.lo)(r), Module._GetFileNameWithoutExt = r => (Module._GetFileNameWithoutExt = wasmExports.mo)(r), Module._GetPrevDirectoryPath = r => (Module._GetPrevDirectoryPath = wasmExports.no)(r), Module._GetApplicationDirectory = () => (Module._GetApplicationDirectory = wasmExports.oo)(), Module._LoadDirectoryFiles = (r, t) => (Module._LoadDirectoryFiles = wasmExports.po)(r, t), Module._LoadDirectoryFilesEx = (r, t, n, e) => (Module._LoadDirectoryFilesEx = wasmExports.qo)(r, t, n, e), Module._UnloadDirectoryFiles = r => (Module._UnloadDirectoryFiles = wasmExports.ro)(r), Module._ChangeDirectory = r => (Module._ChangeDirectory = wasmExports.so)(r), Module._IsPathFile = r => (Module._IsPathFile = wasmExports.to)(r), Module._IsFileDropped = () => (Module._IsFileDropped = wasmExports.uo)(), Module._LoadDroppedFiles = r => (Module._LoadDroppedFiles = wasmExports.vo)(r), Module._UnloadDroppedFiles = r => (Module._UnloadDroppedFiles = wasmExports.wo)(r), Module._GetFileModTime = r => (Module._GetFileModTime = wasmExports.xo)(r), Module._CompressData = (r, t, n) => (Module._CompressData = wasmExports.yo)(r, t, n), Module._EncodeDataBase64 = (r, t, n) => (Module._EncodeDataBase64 = wasmExports.zo)(r, t, n), Module._DecodeDataBase64 = (r, t) => (Module._DecodeDataBase64 = wasmExports.Ao)(r, t), Module._OpenURL = r => (Module._OpenURL = wasmExports.Bo)(r), Module._IsKeyPressedRepeat = r => (Module._IsKeyPressedRepeat = wasmExports.Co)(r), Module._IsKeyReleased = r => (Module._IsKeyReleased = wasmExports.Do)(r), Module._IsKeyUp = r => (Module._IsKeyUp = wasmExports.Eo)(r), Module._GetKeyPressed = () => (Module._GetKeyPressed = wasmExports.Fo)(), Module._SetExitKey = r => (Module._SetExitKey = wasmExports.Go)(r), Module._GetGamepadName = r => (Module._GetGamepadName = wasmExports.Ho)(r), Module._GetGamepadAxisCount = r => (Module._GetGamepadAxisCount = wasmExports.Io)(r), Module._IsGamepadButtonPressed = (r, t) => (Module._IsGamepadButtonPressed = wasmExports.Jo)(r, t), Module._IsGamepadButtonDown = (r, t) => (Module._IsGamepadButtonDown = wasmExports.Ko)(r, t), Module._IsGamepadButtonReleased = (r, t) => (Module._IsGamepadButtonReleased = wasmExports.Lo)(r, t), Module._IsGamepadButtonUp = (r, t) => (Module._IsGamepadButtonUp = wasmExports.Mo)(r, t), Module._GetGamepadButtonPressed = () => (Module._GetGamepadButtonPressed = wasmExports.No)(), Module._SetGamepadMappings = r => (Module._SetGamepadMappings = wasmExports.Oo)(r), Module._IsMouseButtonUp = r => (Module._IsMouseButtonUp = wasmExports.Po)(r), Module._GetMouseX = () => (Module._GetMouseX = wasmExports.Qo)(), Module._GetMouseY = () => (Module._GetMouseY = wasmExports.Ro)(), Module._SetMouseOffset = (r, t) => (Module._SetMouseOffset = wasmExports.So)(r, t), Module._SetMouseScale = (r, t) => (Module._SetMouseScale = wasmExports.To)(r, t), Module._GetMouseWheelMoveV = r => (Module._GetMouseWheelMoveV = wasmExports.Uo)(r), Module._SetMouseCursor = r => (Module._SetMouseCursor = wasmExports.Vo)(r), Module._GetTouchX = () => (Module._GetTouchX = wasmExports.Wo)(), Module._GetTouchY = () => (Module._GetTouchY = wasmExports.Xo)(), Module._GetTouchPosition = (r, t) => (Module._GetTouchPosition = wasmExports.Yo)(r, t), Module._GetTouchPointId = r => (Module._GetTouchPointId = wasmExports.Zo)(r), Module._GetTouchPointCount = () => (Module._GetTouchPointCount = wasmExports._o)(), Module._SaveFileData = (r, t, n) => (Module._SaveFileData = wasmExports.$o)(r, t, n), Module._DrawLine3D = (r, t, n) => (Module._DrawLine3D = wasmExports.ap)(r, t, n), Module._DrawPoint3D = (r, t) => (Module._DrawPoint3D = wasmExports.bp)(r, t), Module._DrawCircle3D = (r, t, n, e, a) => (Module._DrawCircle3D = wasmExports.cp)(r, t, n, e, a), Module._DrawTriangle3D = (r, t, n, e) => (Module._DrawTriangle3D = wasmExports.dp)(r, t, n, e), Module._DrawTriangleStrip3D = (r, t, n) => (Module._DrawTriangleStrip3D = wasmExports.ep)(r, t, n), Module._DrawCube = (r, t, n, e, a) => (Module._DrawCube = wasmExports.fp)(r, t, n, e, a), Module._DrawCubeV = (r, t, n) => (Module._DrawCubeV = wasmExports.gp)(r, t, n), Module._DrawCubeWires = (r, t, n, e, a) => (Module._DrawCubeWires = wasmExports.hp)(r, t, n, e, a), Module._DrawCubeWiresV = (r, t, n) => (Module._DrawCubeWiresV = wasmExports.ip)(r, t, n), Module._DrawSphere = (r, t, n) => (Module._DrawSphere = wasmExports.jp)(r, t, n), Module._DrawSphereEx = (r, t, n, e, a) => (Module._DrawSphereEx = wasmExports.kp)(r, t, n, e, a), Module._DrawSphereWires = (r, t, n, e, a) => (Module._DrawSphereWires = wasmExports.lp)(r, t, n, e, a), Module._DrawCylinder = (r, t, n, e, a, _) => (Module._DrawCylinder = wasmExports.mp)(r, t, n, e, a, _), Module._DrawCylinderEx = (r, t, n, e, a, _) => (Module._DrawCylinderEx = wasmExports.np)(r, t, n, e, a, _), Module._DrawCylinderWires = (r, t, n, e, a, _) => (Module._DrawCylinderWires = wasmExports.op)(r, t, n, e, a, _), Module._DrawCylinderWiresEx = (r, t, n, e, a, _) => (Module._DrawCylinderWiresEx = wasmExports.pp)(r, t, n, e, a, _), Module._DrawCapsule = (r, t, n, e, a, _) => (Module._DrawCapsule = wasmExports.qp)(r, t, n, e, a, _), Module._DrawCapsuleWires = (r, t, n, e, a, _) => (Module._DrawCapsuleWires = wasmExports.rp)(r, t, n, e, a, _), Module._DrawPlane = (r, t, n) => (Module._DrawPlane = wasmExports.sp)(r, t, n), Module._DrawRay = (r, t) => (Module._DrawRay = wasmExports.tp)(r, t), Module._DrawGrid = (r, t) => (Module._DrawGrid = wasmExports.up)(r, t), Module._LoadModel = (r, t) => (Module._LoadModel = wasmExports.vp)(r, t), Module._UploadMesh = (r, t) => (Module._UploadMesh = wasmExports.wp)(r, t), Module._GenMeshCube = (r, t, n, e) => (Module._GenMeshCube = wasmExports.xp)(r, t, n, e), Module._LoadMaterialDefault = r => (Module._LoadMaterialDefault = wasmExports.yp)(r), Module._LoadModelFromMesh = (r, t) => (Module._LoadModelFromMesh = wasmExports.zp)(r, t), Module._IsModelReady = r => (Module._IsModelReady = wasmExports.Ap)(r), Module._UnloadModel = r => (Module._UnloadModel = wasmExports.Bp)(r), Module._UnloadMesh = r => (Module._UnloadMesh = wasmExports.Cp)(r), Module._GetModelBoundingBox = (r, t) => (Module._GetModelBoundingBox = wasmExports.Dp)(r, t), Module._GetMeshBoundingBox = (r, t) => (Module._GetMeshBoundingBox = wasmExports.Ep)(r, t), Module._UpdateMeshBuffer = (r, t, n, e, a) => (Module._UpdateMeshBuffer = wasmExports.Fp)(r, t, n, e, a), Module._DrawMesh = (r, t, n) => (Module._DrawMesh = wasmExports.Gp)(r, t, n), Module._DrawMeshInstanced = (r, t, n, e) => (Module._DrawMeshInstanced = wasmExports.Hp)(r, t, n, e), Module._ExportMesh = (r, t) => (Module._ExportMesh = wasmExports.Ip)(r, t), Module._LoadMaterials = (r, t) => (Module._LoadMaterials = wasmExports.Jp)(r, t), Module._IsMaterialReady = r => (Module._IsMaterialReady = wasmExports.Kp)(r), Module._UnloadMaterial = r => (Module._UnloadMaterial = wasmExports.Lp)(r), Module._SetMaterialTexture = (r, t, n) => (Module._SetMaterialTexture = wasmExports.Mp)(r, t, n), Module._SetModelMeshMaterial = (r, t, n) => (Module._SetModelMeshMaterial = wasmExports.Np)(r, t, n), Module._LoadModelAnimations = (r, t) => (Module._LoadModelAnimations = wasmExports.Op)(r, t), Module._UpdateModelAnimation = (r, t, n) => (Module._UpdateModelAnimation = wasmExports.Pp)(r, t, n), Module._UnloadModelAnimations = (r, t) => (Module._UnloadModelAnimations = wasmExports.Qp)(r, t), Module._UnloadModelAnimation = r => (Module._UnloadModelAnimation = wasmExports.Rp)(r), Module._IsModelAnimationValid = (r, t) => (Module._IsModelAnimationValid = wasmExports.Sp)(r, t), Module._GenMeshPoly = (r, t, n) => (Module._GenMeshPoly = wasmExports.Tp)(r, t, n), Module._GenMeshPlane = (r, t, n, e, a) => (Module._GenMeshPlane = wasmExports.Up)(r, t, n, e, a), Module._GenMeshSphere = (r, t, n, e) => (Module._GenMeshSphere = wasmExports.Vp)(r, t, n, e), Module._GenMeshHemiSphere = (r, t, n, e) => (Module._GenMeshHemiSphere = wasmExports.Wp)(r, t, n, e), Module._GenMeshCylinder = (r, t, n, e) => (Module._GenMeshCylinder = wasmExports.Xp)(r, t, n, e), Module._GenMeshCone = (r, t, n, e) => (Module._GenMeshCone = wasmExports.Yp)(r, t, n, e), Module._GenMeshTorus = (r, t, n, e, a) => (Module._GenMeshTorus = wasmExports.Zp)(r, t, n, e, a), Module._GenMeshKnot = (r, t, n, e, a) => (Module._GenMeshKnot = wasmExports._p)(r, t, n, e, a), Module._GenMeshHeightmap = (r, t, n) => (Module._GenMeshHeightmap = wasmExports.$p)(r, t, n), Module._GenMeshCubicmap = (r, t, n) => (Module._GenMeshCubicmap = wasmExports.aq)(r, t, n), Module._GenMeshTangents = r => (Module._GenMeshTangents = wasmExports.bq)(r), Module._DrawModel = (r, t, n, e) => (Module._DrawModel = wasmExports.cq)(r, t, n, e), Module._DrawModelEx = (r, t, n, e, a, _) => (Module._DrawModelEx = wasmExports.dq)(r, t, n, e, a, _), Module._DrawModelWires = (r, t, n, e) => (Module._DrawModelWires = wasmExports.eq)(r, t, n, e), Module._DrawModelWiresEx = (r, t, n, e, a, _) => (Module._DrawModelWiresEx = wasmExports.fq)(r, t, n, e, a, _), Module._DrawBillboard = (r, t, n, e, a) => (Module._DrawBillboard = wasmExports.gq)(r, t, n, e, a), Module._DrawBillboardPro = (r, t, n, e, a, _, u, c, m) => (Module._DrawBillboardPro = wasmExports.hq)(r, t, n, e, a, _, u, c, m), Module._DrawBillboardRec = (r, t, n, e, a, _) => (Module._DrawBillboardRec = wasmExports.iq)(r, t, n, e, a, _), Module._DrawBoundingBox = (r, t) => (Module._DrawBoundingBox = wasmExports.jq)(r, t), Module._CheckCollisionSpheres = (r, t, n, e) => (Module._CheckCollisionSpheres = wasmExports.kq)(r, t, n, e), Module._CheckCollisionBoxes = (r, t) => (Module._CheckCollisionBoxes = wasmExports.lq)(r, t), Module._CheckCollisionBoxSphere = (r, t, n) => (Module._CheckCollisionBoxSphere = wasmExports.mq)(r, t, n), Module._GetRayCollisionSphere = (r, t, n, e) => (Module._GetRayCollisionSphere = wasmExports.nq)(r, t, n, e), Module._GetRayCollisionBox = (r, t, n) => (Module._GetRayCollisionBox = wasmExports.oq)(r, t, n), Module._GetRayCollisionMesh = (r, t, n, e) => (Module._GetRayCollisionMesh = wasmExports.pq)(r, t, n, e), Module._GetRayCollisionTriangle = (r, t, n, e, a) => (Module._GetRayCollisionTriangle = wasmExports.qq)(r, t, n, e, a), Module._GetRayCollisionQuad = (r, t, n, e, a, _) => (Module._GetRayCollisionQuad = wasmExports.rq)(r, t, n, e, a, _), Module._DrawPixel = (r, t, n) => (Module._DrawPixel = wasmExports.sq)(r, t, n), Module._DrawPixelV = (r, t) => (Module._DrawPixelV = wasmExports.tq)(r, t), Module._DrawLine = (r, t, n, e, a) => (Module._DrawLine = wasmExports.uq)(r, t, n, e, a), Module._DrawLineV = (r, t, n) => (Module._DrawLineV = wasmExports.vq)(r, t, n), Module._DrawLineEx = (r, t, n, e) => (Module._DrawLineEx = wasmExports.wq)(r, t, n, e), Module._DrawTriangleStrip = (r, t, n) => (Module._DrawTriangleStrip = wasmExports.xq)(r, t, n), Module._DrawLineBezier = (r, t, n, e) => (Module._DrawLineBezier = wasmExports.yq)(r, t, n, e), Module._DrawLineBezierQuad = (r, t, n, e, a) => (Module._DrawLineBezierQuad = wasmExports.zq)(r, t, n, e, a), Module._DrawLineBezierCubic = (r, t, n, e, a, _) => (Module._DrawLineBezierCubic = wasmExports.Aq)(r, t, n, e, a, _), Module._DrawLineBSpline = (r, t, n, e) => (Module._DrawLineBSpline = wasmExports.Bq)(r, t, n, e), Module._DrawCircleSector = (r, t, n, e, a, _) => (Module._DrawCircleSector = wasmExports.Cq)(r, t, n, e, a, _), Module._DrawCircleV = (r, t, n) => (Module._DrawCircleV = wasmExports.Dq)(r, t, n), Module._DrawLineCatmullRom = (r, t, n, e) => (Module._DrawLineCatmullRom = wasmExports.Eq)(r, t, n, e), Module._DrawLineStrip = (r, t, n) => (Module._DrawLineStrip = wasmExports.Fq)(r, t, n), Module._DrawCircleSectorLines = (r, t, n, e, a, _) => (Module._DrawCircleSectorLines = wasmExports.Gq)(r, t, n, e, a, _), Module._DrawCircleGradient = (r, t, n, e, a) => (Module._DrawCircleGradient = wasmExports.Hq)(r, t, n, e, a), Module._DrawCircleLines = (r, t, n, e) => (Module._DrawCircleLines = wasmExports.Iq)(r, t, n, e), Module._DrawEllipse = (r, t, n, e, a) => (Module._DrawEllipse = wasmExports.Jq)(r, t, n, e, a), Module._DrawEllipseLines = (r, t, n, e, a) => (Module._DrawEllipseLines = wasmExports.Kq)(r, t, n, e, a), Module._DrawRing = (r, t, n, e, a, _, u) => (Module._DrawRing = wasmExports.Lq)(r, t, n, e, a, _, u), Module._DrawRingLines = (r, t, n, e, a, _, u) => (Module._DrawRingLines = wasmExports.Mq)(r, t, n, e, a, _, u), Module._DrawRectanglePro = (r, t, n, e) => (Module._DrawRectanglePro = wasmExports.Nq)(r, t, n, e), Module._DrawRectangleV = (r, t, n) => (Module._DrawRectangleV = wasmExports.Oq)(r, t, n), Module._DrawRectangleGradientH = (r, t, n, e, a, _) => (Module._DrawRectangleGradientH = wasmExports.Pq)(r, t, n, e, a, _), Module._DrawRectangleLines = (r, t, n, e, a) => (Module._DrawRectangleLines = wasmExports.Qq)(r, t, n, e, a), Module._DrawRectangleLinesEx = (r, t, n) => (Module._DrawRectangleLinesEx = wasmExports.Rq)(r, t, n), Module._DrawRectangleRounded = (r, t, n, e) => (Module._DrawRectangleRounded = wasmExports.Sq)(r, t, n, e), Module._DrawRectangleRoundedLines = (r, t, n, e, a) => (Module._DrawRectangleRoundedLines = wasmExports.Tq)(r, t, n, e, a), Module._DrawTriangle = (r, t, n, e) => (Module._DrawTriangle = wasmExports.Uq)(r, t, n, e), Module._DrawTriangleLines = (r, t, n, e) => (Module._DrawTriangleLines = wasmExports.Vq)(r, t, n, e), Module._DrawTriangleFan = (r, t, n) => (Module._DrawTriangleFan = wasmExports.Wq)(r, t, n), Module._DrawPoly = (r, t, n, e, a) => (Module._DrawPoly = wasmExports.Xq)(r, t, n, e, a), Module._DrawPolyLines = (r, t, n, e, a) => (Module._DrawPolyLines = wasmExports.Yq)(r, t, n, e, a), Module._DrawPolyLinesEx = (r, t, n, e, a, _) => (Module._DrawPolyLinesEx = wasmExports.Zq)(r, t, n, e, a, _), Module._CheckCollisionPointCircle = (r, t, n) => (Module._CheckCollisionPointCircle = wasmExports._q)(r, t, n), Module._CheckCollisionCircles = (r, t, n, e) => (Module._CheckCollisionCircles = wasmExports.$q)(r, t, n, e), Module._CheckCollisionPointTriangle = (r, t, n, e) => (Module._CheckCollisionPointTriangle = wasmExports.ar)(r, t, n, e), Module._CheckCollisionPointPoly = (r, t, n) => (Module._CheckCollisionPointPoly = wasmExports.br)(r, t, n), Module._CheckCollisionRecs = (r, t) => (Module._CheckCollisionRecs = wasmExports.cr)(r, t), Module._CheckCollisionCircleRec = (r, t, n) => (Module._CheckCollisionCircleRec = wasmExports.dr)(r, t, n), Module._CheckCollisionLines = (r, t, n, e, a) => (Module._CheckCollisionLines = wasmExports.er)(r, t, n, e, a), Module._CheckCollisionPointLine = (r, t, n, e) => (Module._CheckCollisionPointLine = wasmExports.fr)(r, t, n, e), Module._GetCollisionRec = (r, t, n) => (Module._GetCollisionRec = wasmExports.gr)(r, t, n), Module._ImageFromImage = (r, t, n) => (Module._ImageFromImage = wasmExports.hr)(r, t, n), Module._UnloadImage = r => (Module._UnloadImage = wasmExports.ir)(r), Module._LoadFont = (r, t) => (Module._LoadFont = wasmExports.jr)(r, t), Module._LoadFileData = (r, t) => (Module._LoadFileData = wasmExports.kr)(r, t), Module._LoadFontFromMemory = (r, t, n, e, a, _, u) => (Module._LoadFontFromMemory = wasmExports.lr)(r, t, n, e, a, _, u), Module._UnloadFileData = r => (Module._UnloadFileData = wasmExports.mr)(r), Module._LoadImage = (r, t) => (Module._LoadImage = wasmExports.nr)(r, t), Module._LoadFontFromImage = (r, t, n, e) => (Module._LoadFontFromImage = wasmExports.or)(r, t, n, e), Module._SetTextureFilter = (r, t) => (Module._SetTextureFilter = wasmExports.pr)(r, t), Module._LoadImageColors = r => (Module._LoadImageColors = wasmExports.qr)(r), Module._LoadFontData = (r, t, n, e, a, _) => (Module._LoadFontData = wasmExports.rr)(r, t, n, e, a, _), Module._GenImageFontAtlas = (r, t, n, e, a, _, u) => (Module._GenImageFontAtlas = wasmExports.sr)(r, t, n, e, a, _, u), Module._TextIsEqual = (r, t) => (Module._TextIsEqual = wasmExports.tr)(r, t), Module._IsFontReady = r => (Module._IsFontReady = wasmExports.ur)(r), Module._UnloadFontData = (r, t) => (Module._UnloadFontData = wasmExports.vr)(r, t), Module._UnloadFont = r => (Module._UnloadFont = wasmExports.wr)(r), Module._ExportFontAsCode = (r, t) => (Module._ExportFontAsCode = wasmExports.xr)(r, t), Module._LoadImageFromTexture = (r, t) => (Module._LoadImageFromTexture = wasmExports.yr)(r, t), Module._GetPixelDataSize = (r, t, n) => (Module._GetPixelDataSize = wasmExports.zr)(r, t, n), Module._SaveFileText = (r, t) => (Module._SaveFileText = wasmExports.Ar)(r, t), Module._TextToPascal = r => (Module._TextToPascal = wasmExports.Br)(r), Module._TextToUpper = r => (Module._TextToUpper = wasmExports.Cr)(r), Module._DrawFPS = (r, t) => (Module._DrawFPS = wasmExports.Dr)(r, t), Module._DrawTextEx = (r, t, n, e, a, _) => (Module._DrawTextEx = wasmExports.Er)(r, t, n, e, a, _), Module._DrawTexturePro = (r, t, n, e, a, _) => (Module._DrawTexturePro = wasmExports.Fr)(r, t, n, e, a, _), Module._DrawTextPro = (r, t, n, e, a, _, u, c) => (Module._DrawTextPro = wasmExports.Gr)(r, t, n, e, a, _, u, c), Module._DrawTextCodepoints = (r, t, n, e, a, _, u) => (Module._DrawTextCodepoints = wasmExports.Hr)(r, t, n, e, a, _, u), Module._SetTextLineSpacing = r => (Module._SetTextLineSpacing = wasmExports.Ir)(r), Module._MeasureText = (r, t) => (Module._MeasureText = wasmExports.Jr)(r, t), Module._GetGlyphInfo = (r, t, n) => (Module._GetGlyphInfo = wasmExports.Kr)(r, t, n), Module._GetGlyphAtlasRec = (r, t, n) => (Module._GetGlyphAtlasRec = wasmExports.Lr)(r, t, n), Module._TextCopy = (r, t) => (Module._TextCopy = wasmExports.Mr)(r, t), Module._TextSubtext = (r, t, n) => (Module._TextSubtext = wasmExports.Nr)(r, t, n), Module._TextReplace = (r, t, n) => (Module._TextReplace = wasmExports.Or)(r, t, n), Module._TextInsert = (r, t, n) => (Module._TextInsert = wasmExports.Pr)(r, t, n), Module._TextJoin = (r, t, n) => (Module._TextJoin = wasmExports.Qr)(r, t, n), Module._TextAppend = (r, t, n) => (Module._TextAppend = wasmExports.Rr)(r, t, n), Module._TextFindIndex = (r, t) => (Module._TextFindIndex = wasmExports.Sr)(r, t), Module._LoadUTF8 = (r, t) => (Module._LoadUTF8 = wasmExports.Tr)(r, t), Module._UnloadUTF8 = r => (Module._UnloadUTF8 = wasmExports.Ur)(r), Module._GetCodepointCount = r => (Module._GetCodepointCount = wasmExports.Vr)(r), Module._LoadImageFromMemory = (r, t, n, e) => (Module._LoadImageFromMemory = wasmExports.Wr)(r, t, n, e), Module._LoadImageRaw = (r, t, n, e, a, _) => (Module._LoadImageRaw = wasmExports.Xr)(r, t, n, e, a, _), Module._LoadImageSvg = (r, t, n, e) => (Module._LoadImageSvg = wasmExports.Yr)(r, t, n, e), Module._LoadImageAnim = (r, t, n) => (Module._LoadImageAnim = wasmExports.Zr)(r, t, n), Module._LoadImageFromScreen = r => (Module._LoadImageFromScreen = wasmExports._r)(r), Module._IsImageReady = r => (Module._IsImageReady = wasmExports.$r)(r), Module._ExportImageToMemory = (r, t, n) => (Module._ExportImageToMemory = wasmExports.as)(r, t, n), Module._ExportImageAsCode = (r, t) => (Module._ExportImageAsCode = wasmExports.bs)(r, t), Module._GenImageColor = (r, t, n, e) => (Module._GenImageColor = wasmExports.cs)(r, t, n, e), Module._GenImageGradientLinear = (r, t, n, e, a, _) => (Module._GenImageGradientLinear = wasmExports.ds)(r, t, n, e, a, _), Module._GenImageGradientRadial = (r, t, n, e, a, _) => (Module._GenImageGradientRadial = wasmExports.es)(r, t, n, e, a, _), Module._GenImageGradientSquare = (r, t, n, e, a, _) => (Module._GenImageGradientSquare = wasmExports.fs)(r, t, n, e, a, _), Module._GenImageChecked = (r, t, n, e, a, _, u) => (Module._GenImageChecked = wasmExports.gs)(r, t, n, e, a, _, u), Module._GenImageWhiteNoise = (r, t, n, e) => (Module._GenImageWhiteNoise = wasmExports.hs)(r, t, n, e), Module._GenImagePerlinNoise = (r, t, n, e, a, _) => (Module._GenImagePerlinNoise = wasmExports.is)(r, t, n, e, a, _), Module._GenImageCellular = (r, t, n, e) => (Module._GenImageCellular = wasmExports.js)(r, t, n, e), Module._GenImageText = (r, t, n, e) => (Module._GenImageText = wasmExports.ks)(r, t, n, e), Module._ImageCopy = (r, t) => (Module._ImageCopy = wasmExports.ls)(r, t), Module._ImageCrop = (r, t) => (Module._ImageCrop = wasmExports.ms)(r, t), Module._ImageFormat = (r, t) => (Module._ImageFormat = wasmExports.ns)(r, t), Module._ImageMipmaps = r => (Module._ImageMipmaps = wasmExports.os)(r), Module._ImageResize = (r, t, n) => (Module._ImageResize = wasmExports.ps)(r, t, n), Module._ImageText = (r, t, n, e) => (Module._ImageText = wasmExports.qs)(r, t, n, e), Module._ImageTextEx = (r, t, n, e, a, _) => (Module._ImageTextEx = wasmExports.rs)(r, t, n, e, a, _), Module._ImageDraw = (r, t, n, e, a) => (Module._ImageDraw = wasmExports.ss)(r, t, n, e, a), Module._ImageResizeNN = (r, t, n) => (Module._ImageResizeNN = wasmExports.ts)(r, t, n), Module._GetPixelColor = (r, t, n) => (Module._GetPixelColor = wasmExports.us)(r, t, n), Module._SetPixelColor = (r, t, n) => (Module._SetPixelColor = wasmExports.vs)(r, t, n), Module._UnloadImageColors = r => (Module._UnloadImageColors = wasmExports.ws)(r), Module._ImageResizeCanvas = (r, t, n, e, a, _) => (Module._ImageResizeCanvas = wasmExports.xs)(r, t, n, e, a, _), Module._ImageToPOT = (r, t) => (Module._ImageToPOT = wasmExports.ys)(r, t), Module._ImageAlphaCrop = (r, t) => (Module._ImageAlphaCrop = wasmExports.zs)(r, t), Module._GetImageAlphaBorder = (r, t, n) => (Module._GetImageAlphaBorder = wasmExports.As)(r, t, n), Module._ImageAlphaClear = (r, t, n) => (Module._ImageAlphaClear = wasmExports.Bs)(r, t, n), Module._ImageAlphaMask = (r, t) => (Module._ImageAlphaMask = wasmExports.Cs)(r, t), Module._ImageAlphaPremultiply = r => (Module._ImageAlphaPremultiply = wasmExports.Ds)(r), Module._ImageBlurGaussian = (r, t) => (Module._ImageBlurGaussian = wasmExports.Es)(r, t), Module._ImageDither = (r, t, n, e, a) => (Module._ImageDither = wasmExports.Fs)(r, t, n, e, a), Module._ImageFlipVertical = r => (Module._ImageFlipVertical = wasmExports.Gs)(r), Module._ImageFlipHorizontal = r => (Module._ImageFlipHorizontal = wasmExports.Hs)(r), Module._ImageRotate = (r, t) => (Module._ImageRotate = wasmExports.Is)(r, t), Module._ImageRotateCW = r => (Module._ImageRotateCW = wasmExports.Js)(r), Module._ImageRotateCCW = r => (Module._ImageRotateCCW = wasmExports.Ks)(r), Module._ImageColorTint = (r, t) => (Module._ImageColorTint = wasmExports.Ls)(r, t), Module._ImageColorInvert = r => (Module._ImageColorInvert = wasmExports.Ms)(r), Module._ImageColorGrayscale = r => (Module._ImageColorGrayscale = wasmExports.Ns)(r), Module._ImageColorContrast = (r, t) => (Module._ImageColorContrast = wasmExports.Os)(r, t), Module._ImageColorBrightness = (r, t) => (Module._ImageColorBrightness = wasmExports.Ps)(r, t), Module._ImageColorReplace = (r, t, n) => (Module._ImageColorReplace = wasmExports.Qs)(r, t, n), Module._LoadImagePalette = (r, t, n) => (Module._LoadImagePalette = wasmExports.Rs)(r, t, n), Module._UnloadImagePalette = r => (Module._UnloadImagePalette = wasmExports.Ss)(r), Module._GetImageColor = (r, t, n, e) => (Module._GetImageColor = wasmExports.Ts)(r, t, n, e), Module._ImageClearBackground = (r, t) => (Module._ImageClearBackground = wasmExports.Us)(r, t), Module._ImageDrawPixel = (r, t, n, e) => (Module._ImageDrawPixel = wasmExports.Vs)(r, t, n, e), Module._ImageDrawPixelV = (r, t, n) => (Module._ImageDrawPixelV = wasmExports.Ws)(r, t, n), Module._ImageDrawLine = (r, t, n, e, a, _) => (Module._ImageDrawLine = wasmExports.Xs)(r, t, n, e, a, _), Module._ImageDrawLineV = (r, t, n, e) => (Module._ImageDrawLineV = wasmExports.Ys)(r, t, n, e), Module._ImageDrawCircle = (r, t, n, e, a) => (Module._ImageDrawCircle = wasmExports.Zs)(r, t, n, e, a), Module._ImageDrawRectangleRec = (r, t, n) => (Module._ImageDrawRectangleRec = wasmExports._s)(r, t, n), Module._ImageDrawRectangle = (r, t, n, e, a, _) => (Module._ImageDrawRectangle = wasmExports.$s)(r, t, n, e, a, _), Module._ImageDrawCircleV = (r, t, n, e) => (Module._ImageDrawCircleV = wasmExports.at)(r, t, n, e), Module._ImageDrawCircleLines = (r, t, n, e, a) => (Module._ImageDrawCircleLines = wasmExports.bt)(r, t, n, e, a), Module._ImageDrawCircleLinesV = (r, t, n, e) => (Module._ImageDrawCircleLinesV = wasmExports.ct)(r, t, n, e), Module._ImageDrawRectangleV = (r, t, n, e) => (Module._ImageDrawRectangleV = wasmExports.dt)(r, t, n, e), Module._ImageDrawRectangleLines = (r, t, n, e) => (Module._ImageDrawRectangleLines = wasmExports.et)(r, t, n, e), Module._ColorAlphaBlend = (r, t, n, e) => (Module._ColorAlphaBlend = wasmExports.ft)(r, t, n, e), Module._ImageDrawText = (r, t, n, e, a, _) => (Module._ImageDrawText = wasmExports.gt)(r, t, n, e, a, _), Module._ImageDrawTextEx = (r, t, n, e, a, _, u) => (Module._ImageDrawTextEx = wasmExports.ht)(r, t, n, e, a, _, u), Module._LoadTexture = (r, t) => (Module._LoadTexture = wasmExports.it)(r, t), Module._LoadTextureCubemap = (r, t, n) => (Module._LoadTextureCubemap = wasmExports.jt)(r, t, n), Module._LoadRenderTexture = (r, t, n) => (Module._LoadRenderTexture = wasmExports.kt)(r, t, n), Module._IsTextureReady = r => (Module._IsTextureReady = wasmExports.lt)(r), Module._IsRenderTextureReady = r => (Module._IsRenderTextureReady = wasmExports.mt)(r), Module._UnloadRenderTexture = r => (Module._UnloadRenderTexture = wasmExports.nt)(r), Module._UpdateTexture = (r, t) => (Module._UpdateTexture = wasmExports.ot)(r, t), Module._UpdateTextureRec = (r, t, n) => (Module._UpdateTextureRec = wasmExports.pt)(r, t, n), Module._GenTextureMipmaps = r => (Module._GenTextureMipmaps = wasmExports.qt)(r), Module._SetTextureWrap = (r, t) => (Module._SetTextureWrap = wasmExports.rt)(r, t), Module._DrawTexture = (r, t, n, e) => (Module._DrawTexture = wasmExports.st)(r, t, n, e), Module._DrawTextureEx = (r, t, n, e, a) => (Module._DrawTextureEx = wasmExports.tt)(r, t, n, e, a), Module._DrawTextureV = (r, t, n) => (Module._DrawTextureV = wasmExports.ut)(r, t, n), Module._DrawTextureRec = (r, t, n, e) => (Module._DrawTextureRec = wasmExports.vt)(r, t, n, e), Module._DrawTextureNPatch = (r, t, n, e, a, _) => (Module._DrawTextureNPatch = wasmExports.wt)(r, t, n, e, a, _), Module._ColorToInt = r => (Module._ColorToInt = wasmExports.xt)(r), Module._ColorNormalize = (r, t) => (Module._ColorNormalize = wasmExports.yt)(r, t), Module._ColorFromNormalized = (r, t) => (Module._ColorFromNormalized = wasmExports.zt)(r, t), Module._ColorToHSV = (r, t) => (Module._ColorToHSV = wasmExports.At)(r, t), Module._ColorFromHSV = (r, t, n, e) => (Module._ColorFromHSV = wasmExports.Bt)(r, t, n, e), Module._ColorTint = (r, t, n) => (Module._ColorTint = wasmExports.Ct)(r, t, n), Module._ColorBrightness = (r, t, n) => (Module._ColorBrightness = wasmExports.Dt)(r, t, n), Module._ColorContrast = (r, t, n) => (Module._ColorContrast = wasmExports.Et)(r, t, n), Module._ColorAlpha = (r, t, n) => (Module._ColorAlpha = wasmExports.Ft)(r, t, n), Module._SetTraceLogCallback = r => (Module._SetTraceLogCallback = wasmExports.Gt)(r), Module._SetLoadFileDataCallback = r => (Module._SetLoadFileDataCallback = wasmExports.Ht)(r), Module._SetSaveFileDataCallback = r => (Module._SetSaveFileDataCallback = wasmExports.It)(r), Module._SetLoadFileTextCallback = r => (Module._SetLoadFileTextCallback = wasmExports.Jt)(r), Module._SetSaveFileTextCallback = r => (Module._SetSaveFileTextCallback = wasmExports.Kt)(r), Module._SetTraceLogLevel = r => (Module._SetTraceLogLevel = wasmExports.Lt)(r), Module._MemAlloc = r => (Module._MemAlloc = wasmExports.Mt)(r), Module._MemRealloc = (r, t) => (Module._MemRealloc = wasmExports.Nt)(r, t), Module._MemFree = r => (Module._MemFree = wasmExports.Ot)(r), Module._ExportDataAsCode = (r, t, n) => (Module._ExportDataAsCode = wasmExports.Pt)(r, t, n), Module._ma_malloc_emscripten = (r, t) => (Module._ma_malloc_emscripten = wasmExports.Qt)(r, t), Module._ma_free_emscripten = (r, t) => (Module._ma_free_emscripten = wasmExports.Rt)(r, t);
        var _ma_device_process_pcm_frames_capture__webaudio = Module._ma_device_process_pcm_frames_capture__webaudio = (r, t, n) => (_ma_device_process_pcm_frames_capture__webaudio = Module._ma_device_process_pcm_frames_capture__webaudio = wasmExports.St)(r, t, n),
            _ma_device_process_pcm_frames_playback__webaudio = Module._ma_device_process_pcm_frames_playback__webaudio = (r, t, n) => (_ma_device_process_pcm_frames_playback__webaudio = Module._ma_device_process_pcm_frames_playback__webaudio = wasmExports.Tt)(r, t, n);
        Module._InitAudioDevice = () => (Module._InitAudioDevice = wasmExports.Ut)(), Module._CloseAudioDevice = () => (Module._CloseAudioDevice = wasmExports.Vt)(), Module._IsAudioDeviceReady = () => (Module._IsAudioDeviceReady = wasmExports.Wt)(), Module._SetMasterVolume = r => (Module._SetMasterVolume = wasmExports.Xt)(r), Module._LoadWave = (r, t) => (Module._LoadWave = wasmExports.Yt)(r, t), Module._LoadWaveFromMemory = (r, t, n, e) => (Module._LoadWaveFromMemory = wasmExports.Zt)(r, t, n, e), Module._IsWaveReady = r => (Module._IsWaveReady = wasmExports._t)(r), Module._LoadSound = (r, t) => (Module._LoadSound = wasmExports.$t)(r, t), Module._LoadSoundFromWave = (r, t) => (Module._LoadSoundFromWave = wasmExports.au)(r, t), Module._UnloadWave = r => (Module._UnloadWave = wasmExports.bu)(r), Module._LoadSoundAlias = (r, t) => (Module._LoadSoundAlias = wasmExports.cu)(r, t), Module._IsSoundReady = r => (Module._IsSoundReady = wasmExports.du)(r), Module._UnloadSound = r => (Module._UnloadSound = wasmExports.eu)(r), Module._UnloadSoundAlias = r => (Module._UnloadSoundAlias = wasmExports.fu)(r), Module._UpdateSound = (r, t, n) => (Module._UpdateSound = wasmExports.gu)(r, t, n), Module._ExportWave = (r, t) => (Module._ExportWave = wasmExports.hu)(r, t), Module._ExportWaveAsCode = (r, t) => (Module._ExportWaveAsCode = wasmExports.iu)(r, t), Module._PlaySound = r => (Module._PlaySound = wasmExports.ju)(r), Module._PauseSound = r => (Module._PauseSound = wasmExports.ku)(r), Module._ResumeSound = r => (Module._ResumeSound = wasmExports.lu)(r), Module._StopSound = r => (Module._StopSound = wasmExports.mu)(r), Module._IsSoundPlaying = r => (Module._IsSoundPlaying = wasmExports.nu)(r), Module._SetSoundVolume = (r, t) => (Module._SetSoundVolume = wasmExports.ou)(r, t), Module._SetSoundPitch = (r, t) => (Module._SetSoundPitch = wasmExports.pu)(r, t), Module._SetSoundPan = (r, t) => (Module._SetSoundPan = wasmExports.qu)(r, t), Module._WaveFormat = (r, t, n, e) => (Module._WaveFormat = wasmExports.ru)(r, t, n, e), Module._WaveCopy = (r, t) => (Module._WaveCopy = wasmExports.su)(r, t), Module._WaveCrop = (r, t, n) => (Module._WaveCrop = wasmExports.tu)(r, t, n), Module._LoadWaveSamples = r => (Module._LoadWaveSamples = wasmExports.uu)(r), Module._UnloadWaveSamples = r => (Module._UnloadWaveSamples = wasmExports.vu)(r), Module._LoadMusicStream = (r, t) => (Module._LoadMusicStream = wasmExports.wu)(r, t), Module._LoadAudioStream = (r, t, n, e) => (Module._LoadAudioStream = wasmExports.xu)(r, t, n, e), Module._LoadMusicStreamFromMemory = (r, t, n, e) => (Module._LoadMusicStreamFromMemory = wasmExports.yu)(r, t, n, e), Module._IsMusicReady = r => (Module._IsMusicReady = wasmExports.zu)(r), Module._UnloadMusicStream = r => (Module._UnloadMusicStream = wasmExports.Au)(r), Module._UnloadAudioStream = r => (Module._UnloadAudioStream = wasmExports.Bu)(r), Module._PlayMusicStream = r => (Module._PlayMusicStream = wasmExports.Cu)(r), Module._PlayAudioStream = r => (Module._PlayAudioStream = wasmExports.Du)(r), Module._PauseMusicStream = r => (Module._PauseMusicStream = wasmExports.Eu)(r), Module._PauseAudioStream = r => (Module._PauseAudioStream = wasmExports.Fu)(r), Module._ResumeMusicStream = r => (Module._ResumeMusicStream = wasmExports.Gu)(r), Module._ResumeAudioStream = r => (Module._ResumeAudioStream = wasmExports.Hu)(r), Module._StopMusicStream = r => (Module._StopMusicStream = wasmExports.Iu)(r), Module._StopAudioStream = r => (Module._StopAudioStream = wasmExports.Ju)(r), Module._SeekMusicStream = (r, t) => (Module._SeekMusicStream = wasmExports.Ku)(r, t), Module._UpdateMusicStream = r => (Module._UpdateMusicStream = wasmExports.Lu)(r), Module._UpdateAudioStream = (r, t, n) => (Module._UpdateAudioStream = wasmExports.Mu)(r, t, n), Module._IsMusicStreamPlaying = r => (Module._IsMusicStreamPlaying = wasmExports.Nu)(r), Module._IsAudioStreamPlaying = r => (Module._IsAudioStreamPlaying = wasmExports.Ou)(r), Module._SetMusicVolume = (r, t) => (Module._SetMusicVolume = wasmExports.Pu)(r, t), Module._SetAudioStreamVolume = (r, t) => (Module._SetAudioStreamVolume = wasmExports.Qu)(r, t), Module._SetMusicPitch = (r, t) => (Module._SetMusicPitch = wasmExports.Ru)(r, t), Module._SetMusicPan = (r, t) => (Module._SetMusicPan = wasmExports.Su)(r, t), Module._GetMusicTimeLength = r => (Module._GetMusicTimeLength = wasmExports.Tu)(r), Module._GetMusicTimePlayed = r => (Module._GetMusicTimePlayed = wasmExports.Uu)(r), Module._IsAudioStreamReady = r => (Module._IsAudioStreamReady = wasmExports.Vu)(r), Module._IsAudioStreamProcessed = r => (Module._IsAudioStreamProcessed = wasmExports.Wu)(r), Module._SetAudioStreamPitch = (r, t) => (Module._SetAudioStreamPitch = wasmExports.Xu)(r, t), Module._SetAudioStreamPan = (r, t) => (Module._SetAudioStreamPan = wasmExports.Yu)(r, t), Module._SetAudioStreamBufferSizeDefault = r => (Module._SetAudioStreamBufferSizeDefault = wasmExports.Zu)(r), Module._SetAudioStreamCallback = (r, t) => (Module._SetAudioStreamCallback = wasmExports._u)(r, t), Module._AttachAudioStreamProcessor = (r, t) => (Module._AttachAudioStreamProcessor = wasmExports.$u)(r, t), Module._DetachAudioStreamProcessor = (r, t) => (Module._DetachAudioStreamProcessor = wasmExports.av)(r, t), Module._AttachAudioMixedProcessor = r => (Module._AttachAudioMixedProcessor = wasmExports.bv)(r), Module._DetachAudioMixedProcessor = r => (Module._DetachAudioMixedProcessor = wasmExports.cv)(r);
        var __emscripten_stack_restore = r => (__emscripten_stack_restore = wasmExports.dv)(r),
            __emscripten_stack_alloc = r => (__emscripten_stack_alloc = wasmExports.ev)(r),
            _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports.fv)();
        Module.___start_em_js = 99634, Module.___stop_em_js = 99707, Module.cwrap = cwrap, Module.setValue = setValue, Module.getValue = getValue, Module.UTF8ToString = UTF8ToString, Module.stringToUTF8 = stringToUTF8, Module.FS = FS, Module.allocateUTF8 = allocateUTF8;
        var calledRun;
        dependenciesFulfilled = function r() {
            calledRun || run(), calledRun || (dependenciesFulfilled = r)
        };

        function run() {
            if (runDependencies > 0 || (preRun(), runDependencies > 0)) return;

            function r() {
                calledRun || (calledRun = !0, Module.calledRun = !0, !ABORT && (initRuntime(), readyPromiseResolve(Module), Module.onRuntimeInitialized && Module.onRuntimeInitialized(), postRun()))
            }
            Module.setStatus ? (Module.setStatus("Running..."), setTimeout(function() {
                setTimeout(function() {
                    Module.setStatus("")
                }, 1), r()
            }, 1)) : r()
        }
        if (Module.preInit)
            for (typeof Module.preInit == "function" && (Module.preInit = [Module.preInit]); Module.preInit.length > 0;) Module.preInit.pop()();
        return run(), moduleRtn = readyPromise, moduleRtn
    }
})();
class RaylibComponent extends HTMLElement {
    constructor() {
        super(), this.style.display = "none", this.shadow = this.attachShadow({
            mode: "open"
        }), this.canvas = document.createElement("canvas"), window.addEventListener("resize", this.onResize.bind(this)), this.shadow.innerHTML = `
<style>
canvas.landscape {
  height: 100vh;
  max-width: 100vw;
}
canvas.portrait {
  width: 100vw;
  max-height: 100vh;
}
canvas {
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  object-fit: contain;
}
</style>
`, this.shadow.appendChild(this.canvas), this.canvas.addEventListener("contextmenu", t => t.preventDefault())
    }
    onResize() {}
    static get observedAttributes() {
        return ["src", "fill"]
    }
    attributeChangedCallback(t, n, e) {
        t === "fill" && (this.fill = typeof e < "u", this.onResize()), t === "src" && (this.src = e, this.start(this.src))
    }
    async start(t) {
        let n = this.textContent;
        t && (n = await fetch(t).then(e => e.text())), raylib_run_string(this.canvas, n), this.style.display = "block"
    }
}
typeof document < "u" && document.addEventListener("DOMContentLoaded", () => {
    window.customElements.define("raylib-game", RaylibComponent)
});
const wasmBinary = new Uint8Array([CHUNK1HERE]);
var F;
(F = document == null ? void 0 : document.location) == null || F.toString();
async function raylib_run(r, t, n) {
    const e = {},
        a = await Module({
            canvas: r,
            wasmBinary
        });
    e.mod = a, e.Vector2 = class {
        constructor(o = {}, l) {
            this._size = 8, this._address = l || a._malloc(this._size), this.x = o.x || 0, this.y = o.y || 0
        }
        get x() {
            return a.getValue(this._address + 0, "float")
        }
        set x(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get y() {
            return a.getValue(this._address + 4, "float")
        }
        set y(o) {
            a.setValue(this._address + 4, o, "float")
        }
    }, e.Vector3 = class {
        constructor(o = {}, l) {
            this._size = 12, this._address = l || a._malloc(this._size), this.x = o.x || 0, this.y = o.y || 0, this.z = o.z || 0
        }
        get x() {
            return a.getValue(this._address + 0, "float")
        }
        set x(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get y() {
            return a.getValue(this._address + 4, "float")
        }
        set y(o) {
            a.setValue(this._address + 4, o, "float")
        }
        get z() {
            return a.getValue(this._address + 8, "float")
        }
        set z(o) {
            a.setValue(this._address + 8, o, "float")
        }
    }, e.Vector4 = class {
        constructor(o = {}, l) {
            this._size = 16, this._address = l || a._malloc(this._size), this.x = o.x || 0, this.y = o.y || 0, this.z = o.z || 0, this.w = o.w || 0
        }
        get x() {
            return a.getValue(this._address + 0, "float")
        }
        set x(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get y() {
            return a.getValue(this._address + 4, "float")
        }
        set y(o) {
            a.setValue(this._address + 4, o, "float")
        }
        get z() {
            return a.getValue(this._address + 8, "float")
        }
        set z(o) {
            a.setValue(this._address + 8, o, "float")
        }
        get w() {
            return a.getValue(this._address + 12, "float")
        }
        set w(o) {
            a.setValue(this._address + 12, o, "float")
        }
    }, e.Matrix = class {
        constructor(o = {}, l) {
            this._size = 64, this._address = l || a._malloc(this._size), this.m0 = o.m0 || 0, this.m4 = o.m4 || 0, this.m8 = o.m8 || 0, this.m12 = o.m12 || 0, this.m1 = o.m1 || 0, this.m5 = o.m5 || 0, this.m9 = o.m9 || 0, this.m13 = o.m13 || 0, this.m2 = o.m2 || 0, this.m6 = o.m6 || 0, this.m10 = o.m10 || 0, this.m14 = o.m14 || 0, this.m3 = o.m3 || 0, this.m7 = o.m7 || 0, this.m11 = o.m11 || 0, this.m15 = o.m15 || 0
        }
        get m0() {
            return a.getValue(this._address + 0, "float")
        }
        set m0(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get m4() {
            return a.getValue(this._address + 4, "float")
        }
        set m4(o) {
            a.setValue(this._address + 4, o, "float")
        }
        get m8() {
            return a.getValue(this._address + 8, "float")
        }
        set m8(o) {
            a.setValue(this._address + 8, o, "float")
        }
        get m12() {
            return a.getValue(this._address + 12, "float")
        }
        set m12(o) {
            a.setValue(this._address + 12, o, "float")
        }
        get m1() {
            return a.getValue(this._address + 16, "float")
        }
        set m1(o) {
            a.setValue(this._address + 16, o, "float")
        }
        get m5() {
            return a.getValue(this._address + 20, "float")
        }
        set m5(o) {
            a.setValue(this._address + 20, o, "float")
        }
        get m9() {
            return a.getValue(this._address + 24, "float")
        }
        set m9(o) {
            a.setValue(this._address + 24, o, "float")
        }
        get m13() {
            return a.getValue(this._address + 28, "float")
        }
        set m13(o) {
            a.setValue(this._address + 28, o, "float")
        }
        get m2() {
            return a.getValue(this._address + 32, "float")
        }
        set m2(o) {
            a.setValue(this._address + 32, o, "float")
        }
        get m6() {
            return a.getValue(this._address + 36, "float")
        }
        set m6(o) {
            a.setValue(this._address + 36, o, "float")
        }
        get m10() {
            return a.getValue(this._address + 40, "float")
        }
        set m10(o) {
            a.setValue(this._address + 40, o, "float")
        }
        get m14() {
            return a.getValue(this._address + 44, "float")
        }
        set m14(o) {
            a.setValue(this._address + 44, o, "float")
        }
        get m3() {
            return a.getValue(this._address + 48, "float")
        }
        set m3(o) {
            a.setValue(this._address + 48, o, "float")
        }
        get m7() {
            return a.getValue(this._address + 52, "float")
        }
        set m7(o) {
            a.setValue(this._address + 52, o, "float")
        }
        get m11() {
            return a.getValue(this._address + 56, "float")
        }
        set m11(o) {
            a.setValue(this._address + 56, o, "float")
        }
        get m15() {
            return a.getValue(this._address + 60, "float")
        }
        set m15(o) {
            a.setValue(this._address + 60, o, "float")
        }
    }, e.Color = class {
        constructor(o = {}, l) {
            this._size = 4, this._address = l || a._malloc(this._size), this.r = o.r || 0, this.g = o.g || 0, this.b = o.b || 0, this.a = o.a || 0
        }
        get r() {
            return a.HEAPU8[this._address + 0]
        }
        set r(o) {
            a.HEAPU8[this._address + 0] = o
        }
        get g() {
            return a.HEAPU8[this._address + 1]
        }
        set g(o) {
            a.HEAPU8[this._address + 1] = o
        }
        get b() {
            return a.HEAPU8[this._address + 2]
        }
        set b(o) {
            a.HEAPU8[this._address + 2] = o
        }
        get a() {
            return a.HEAPU8[this._address + 3]
        }
        set a(o) {
            a.HEAPU8[this._address + 3] = o
        }
    }, e.Rectangle = class {
        constructor(o = {}, l) {
            this._size = 16, this._address = l || a._malloc(this._size), this.x = o.x || 0, this.y = o.y || 0, this.width = o.width || 0, this.height = o.height || 0
        }
        get x() {
            return a.getValue(this._address + 0, "float")
        }
        set x(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get y() {
            return a.getValue(this._address + 4, "float")
        }
        set y(o) {
            a.setValue(this._address + 4, o, "float")
        }
        get width() {
            return a.getValue(this._address + 8, "float")
        }
        set width(o) {
            a.setValue(this._address + 8, o, "float")
        }
        get height() {
            return a.getValue(this._address + 12, "float")
        }
        set height(o) {
            a.setValue(this._address + 12, o, "float")
        }
    }, e.Image = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.data = o.data || 0, this.width = o.width || 0, this.height = o.height || 0, this.mipmaps = o.mipmaps || 0, this.format = o.format || 0
        }
        get data() {
            return a.getValue(this._address + 0, "*")
        }
        set data(o) {
            a.setValue(this._address + 0, o, "*")
        }
        get width() {
            return a.getValue(this._address + 4, "i32")
        }
        set width(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get height() {
            return a.getValue(this._address + 8, "i32")
        }
        set height(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get mipmaps() {
            return a.getValue(this._address + 12, "i32")
        }
        set mipmaps(o) {
            a.setValue(this._address + 12, o, "i32")
        }
        get format() {
            return a.getValue(this._address + 16, "i32")
        }
        set format(o) {
            a.setValue(this._address + 16, o, "i32")
        }
    }, e.Texture = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.width = o.width || 0, this.height = o.height || 0, this.mipmaps = o.mipmaps || 0, this.format = o.format || 0
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get width() {
            return a.getValue(this._address + 4, "i32")
        }
        set width(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get height() {
            return a.getValue(this._address + 8, "i32")
        }
        set height(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get mipmaps() {
            return a.getValue(this._address + 12, "i32")
        }
        set mipmaps(o) {
            a.setValue(this._address + 12, o, "i32")
        }
        get format() {
            return a.getValue(this._address + 16, "i32")
        }
        set format(o) {
            a.setValue(this._address + 16, o, "i32")
        }
    }, e.RenderTexture = class {
        constructor(o = {}, l) {
            this._size = 44, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.texture = new e.Texture(o.texture || {}, this._address + 4), this.depth = new e.Texture(o.depth || {}, this._address + 24)
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
    }, e.NPatchInfo = class {
        constructor(o = {}, l) {
            this._size = 36, this._address = l || a._malloc(this._size), this.source = new e.Rectangle(o.source || {}, this._address + 0), this.left = o.left || 0, this.top = o.top || 0, this.right = o.right || 0, this.bottom = o.bottom || 0, this.layout = o.layout || 0
        }
        get left() {
            return a.getValue(this._address + 16, "i32")
        }
        set left(o) {
            a.setValue(this._address + 16, o, "i32")
        }
        get top() {
            return a.getValue(this._address + 20, "i32")
        }
        set top(o) {
            a.setValue(this._address + 20, o, "i32")
        }
        get right() {
            return a.getValue(this._address + 24, "i32")
        }
        set right(o) {
            a.setValue(this._address + 24, o, "i32")
        }
        get bottom() {
            return a.getValue(this._address + 28, "i32")
        }
        set bottom(o) {
            a.setValue(this._address + 28, o, "i32")
        }
        get layout() {
            return a.getValue(this._address + 32, "i32")
        }
        set layout(o) {
            a.setValue(this._address + 32, o, "i32")
        }
    }, e.GlyphInfo = class {
        constructor(o = {}, l) {
            this._size = 36, this._address = l || a._malloc(this._size), this.value = o.value || 0, this.offsetX = o.offsetX || 0, this.offsetY = o.offsetY || 0, this.advanceX = o.advanceX || 0, this.image = new e.Image(o.image || {}, this._address + 16)
        }
        get value() {
            return a.getValue(this._address + 0, "i32")
        }
        set value(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get offsetX() {
            return a.getValue(this._address + 4, "i32")
        }
        set offsetX(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get offsetY() {
            return a.getValue(this._address + 8, "i32")
        }
        set offsetY(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get advanceX() {
            return a.getValue(this._address + 12, "i32")
        }
        set advanceX(o) {
            a.setValue(this._address + 12, o, "i32")
        }
    }, e.Font = class {
        constructor(o = {}, l) {
            this._size = 40, this._address = l || a._malloc(this._size), this.baseSize = o.baseSize || 0, this.glyphCount = o.glyphCount || 0, this.glyphPadding = o.glyphPadding || 0, this.texture = new e.Texture2D(o.texture || {}, this._address + 12), this.recs = new e.Rectangle(o.recs || {}, this._address + 32), this.glyphs = new e.GlyphInfo(o.glyphs || {}, this._address + 36)
        }
        get baseSize() {
            return a.getValue(this._address + 0, "i32")
        }
        set baseSize(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get glyphCount() {
            return a.getValue(this._address + 4, "i32")
        }
        set glyphCount(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get glyphPadding() {
            return a.getValue(this._address + 8, "i32")
        }
        set glyphPadding(o) {
            a.setValue(this._address + 8, o, "i32")
        }
    }, e.Camera3D = class {
        constructor(o = {}, l) {
            this._size = 44, this._address = l || a._malloc(this._size), this.position = new e.Vector3(o.position || {}, this._address + 0), this.target = new e.Vector3(o.target || {}, this._address + 12), this.up = new e.Vector3(o.up || {}, this._address + 24), this.fovy = o.fovy || 0, this.projection = o.projection || 0
        }
        get fovy() {
            return a.getValue(this._address + 36, "float")
        }
        set fovy(o) {
            a.setValue(this._address + 36, o, "float")
        }
        get projection() {
            return a.getValue(this._address + 40, "i32")
        }
        set projection(o) {
            a.setValue(this._address + 40, o, "i32")
        }
    }, e.Camera2D = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.offset = new e.Vector2(o.offset || {}, this._address + 0), this.target = new e.Vector2(o.target || {}, this._address + 8), this.rotation = o.rotation || 0, this.zoom = o.zoom || 0
        }
        get rotation() {
            return a.getValue(this._address + 16, "float")
        }
        set rotation(o) {
            a.setValue(this._address + 16, o, "float")
        }
        get zoom() {
            return a.getValue(this._address + 20, "float")
        }
        set zoom(o) {
            a.setValue(this._address + 20, o, "float")
        }
    }, e.Mesh = class {
        constructor(o = {}, l) {
            this._size = 60, this._address = l || a._malloc(this._size), this.vertexCount = o.vertexCount || 0, this.triangleCount = o.triangleCount || 0, this.vertices = o.vertices || 0, this.texcoords = o.texcoords || 0, this.texcoords2 = o.texcoords2 || 0, this.normals = o.normals || 0, this.tangents = o.tangents || 0, this.colors = o.colors || 0, this.indices = o.indices || 0, this.animVertices = o.animVertices || 0, this.animNormals = o.animNormals || 0, this.boneIds = o.boneIds || 0, this.boneWeights = o.boneWeights || 0, this.vaoId = o.vaoId || 0, this.vboId = o.vboId || 0
        }
        get vertexCount() {
            return a.getValue(this._address + 0, "i32")
        }
        set vertexCount(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get triangleCount() {
            return a.getValue(this._address + 4, "i32")
        }
        set triangleCount(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get vertices() {
            return a.getValue(this._address + 8, "*")
        }
        set vertices(o) {
            a.setValue(this._address + 8, o, "*")
        }
        get texcoords() {
            return a.getValue(this._address + 12, "*")
        }
        set texcoords(o) {
            a.setValue(this._address + 12, o, "*")
        }
        get texcoords2() {
            return a.getValue(this._address + 16, "*")
        }
        set texcoords2(o) {
            a.setValue(this._address + 16, o, "*")
        }
        get normals() {
            return a.getValue(this._address + 20, "*")
        }
        set normals(o) {
            a.setValue(this._address + 20, o, "*")
        }
        get tangents() {
            return a.getValue(this._address + 24, "*")
        }
        set tangents(o) {
            a.setValue(this._address + 24, o, "*")
        }
        get colors() {
            return a.getValue(this._address + 28, "*")
        }
        set colors(o) {
            a.setValue(this._address + 28, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 32, "*")
        }
        set indices(o) {
            a.setValue(this._address + 32, o, "*")
        }
        get animVertices() {
            return a.getValue(this._address + 36, "*")
        }
        set animVertices(o) {
            a.setValue(this._address + 36, o, "*")
        }
        get animNormals() {
            return a.getValue(this._address + 40, "*")
        }
        set animNormals(o) {
            a.setValue(this._address + 40, o, "*")
        }
        get boneIds() {
            return a.getValue(this._address + 44, "*")
        }
        set boneIds(o) {
            a.setValue(this._address + 44, o, "*")
        }
        get boneWeights() {
            return a.getValue(this._address + 48, "*")
        }
        set boneWeights(o) {
            a.setValue(this._address + 48, o, "*")
        }
        get vaoId() {
            return a.HEAPU32[this._address + 52]
        }
        set vaoId(o) {
            a.HEAPU32[this._address + 52] = o
        }
        get vboId() {
            return a.getValue(this._address + 56, "*")
        }
        set vboId(o) {
            a.setValue(this._address + 56, o, "*")
        }
    }, e.Shader = class {
        constructor(o = {}, l) {
            this._size = 8, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.locs = o.locs || 0
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get locs() {
            return a.getValue(this._address + 4, "*")
        }
        set locs(o) {
            a.setValue(this._address + 4, o, "*")
        }
    }, e.MaterialMap = class {
        constructor(o = {}, l) {
            this._size = 28, this._address = l || a._malloc(this._size), this.texture = new e.Texture2D(o.texture || {}, this._address + 0), this.color = new e.Color(o.color || {}, this._address + 20), this.value = o.value || 0
        }
        get value() {
            return a.getValue(this._address + 24, "float")
        }
        set value(o) {
            a.setValue(this._address + 24, o, "float")
        }
    }, e.Material = class {
        constructor(o = {}, l) {
            this._size = 28, this._address = l || a._malloc(this._size), this.shader = new e.Shader(o.shader || {}, this._address + 0), this.maps = new e.MaterialMap(o.maps || {}, this._address + 8), this.params = o.params || [0, 0, 0, 0]
        }
        get params() {
            return a.getValue(this._address + 12, "*")
        }
        set params(o) {
            a.setValue(this._address + 12, o, "*")
        }
    }, e.Transform = class {
        constructor(o = {}, l) {
            this._size = 40, this._address = l || a._malloc(this._size), this.translation = new e.Vector3(o.translation || {}, this._address + 0), this.rotation = new e.Quaternion(o.rotation || {}, this._address + 12), this.scale = new e.Vector3(o.scale || {}, this._address + 28)
        }
    }, e.BoneInfo = class {
        constructor(o = {}, l) {
            this._size = 36, this._address = l || a._malloc(this._size), this.name = o.name || "", this.parent = o.parent || 0
        }
        get name() {
            return a.UTF8ToString(this._address + 0)
        }
        set name(o) {
            a.stringToUTF8(this._address + 0, o)
        }
        get parent() {
            return a.getValue(this._address + 32, "i32")
        }
        set parent(o) {
            a.setValue(this._address + 32, o, "i32")
        }
    }, e.Model = class {
        constructor(o = {}, l) {
            this._size = 96, this._address = l || a._malloc(this._size), this.transform = new e.Matrix(o.transform || {}, this._address + 0), this.meshCount = o.meshCount || 0, this.materialCount = o.materialCount || 0, this.meshes = new e.Mesh(o.meshes || {}, this._address + 72), this.materials = new e.Material(o.materials || {}, this._address + 76), this.meshMaterial = o.meshMaterial || 0, this.boneCount = o.boneCount || 0, this.bones = new e.BoneInfo(o.bones || {}, this._address + 88), this.bindPose = new e.Transform(o.bindPose || {}, this._address + 92)
        }
        get meshCount() {
            return a.getValue(this._address + 64, "i32")
        }
        set meshCount(o) {
            a.setValue(this._address + 64, o, "i32")
        }
        get materialCount() {
            return a.getValue(this._address + 68, "i32")
        }
        set materialCount(o) {
            a.setValue(this._address + 68, o, "i32")
        }
        get meshMaterial() {
            return a.getValue(this._address + 80, "*")
        }
        set meshMaterial(o) {
            a.setValue(this._address + 80, o, "*")
        }
        get boneCount() {
            return a.getValue(this._address + 84, "i32")
        }
        set boneCount(o) {
            a.setValue(this._address + 84, o, "i32")
        }
    }, e.ModelAnimation = class {
        constructor(o = {}, l) {
            this._size = 48, this._address = l || a._malloc(this._size), this.boneCount = o.boneCount || 0, this.frameCount = o.frameCount || 0, this.bones = new e.BoneInfo(o.bones || {}, this._address + 8), this.framePoses = o.framePoses || new e.Transform, this.name = o.name || ""
        }
        get boneCount() {
            return a.getValue(this._address + 0, "i32")
        }
        set boneCount(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get frameCount() {
            return a.getValue(this._address + 4, "i32")
        }
        set frameCount(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get framePoses() {
            return a.getValue(this._address + 12, "*")
        }
        set framePoses(o) {
            a.setValue(this._address + 12, o, "*")
        }
        get name() {
            return a.UTF8ToString(this._address + 16)
        }
        set name(o) {
            a.stringToUTF8(this._address + 16, o)
        }
    }, e.Ray = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.position = new e.Vector3(o.position || {}, this._address + 0), this.direction = new e.Vector3(o.direction || {}, this._address + 12)
        }
    }, e.RayCollision = class {
        constructor(o = {}, l) {
            this._size = 29, this._address = l || a._malloc(this._size), this.hit = o.hit || 0, this.distance = o.distance || 0, this.point = new e.Vector3(o.point || {}, this._address + 5), this.normal = new e.Vector3(o.normal || {}, this._address + 17)
        }
        get hit() {
            return a.getValue(this._address + 0, "i1")
        }
        set hit(o) {
            a.setValue(this._address + 0, o, "i1")
        }
        get distance() {
            return a.getValue(this._address + 1, "float")
        }
        set distance(o) {
            a.setValue(this._address + 1, o, "float")
        }
    }, e.BoundingBox = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.min = new e.Vector3(o.min || {}, this._address + 0), this.max = new e.Vector3(o.max || {}, this._address + 12)
        }
    }, e.Wave = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.frameCount = o.frameCount || 0, this.sampleRate = o.sampleRate || 0, this.sampleSize = o.sampleSize || 0, this.channels = o.channels || 0, this.data = o.data || 0
        }
        get frameCount() {
            return a.HEAPU32[this._address + 0]
        }
        set frameCount(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get sampleRate() {
            return a.HEAPU32[this._address + 4]
        }
        set sampleRate(o) {
            a.HEAPU32[this._address + 4] = o
        }
        get sampleSize() {
            return a.HEAPU32[this._address + 8]
        }
        set sampleSize(o) {
            a.HEAPU32[this._address + 8] = o
        }
        get channels() {
            return a.HEAPU32[this._address + 12]
        }
        set channels(o) {
            a.HEAPU32[this._address + 12] = o
        }
        get data() {
            return a.getValue(this._address + 16, "*")
        }
        set data(o) {
            a.setValue(this._address + 16, o, "*")
        }
    }, e.AudioStream = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.buffer = o.buffer || 0, this.processor = o.processor || 0, this.sampleRate = o.sampleRate || 0, this.sampleSize = o.sampleSize || 0, this.channels = o.channels || 0
        }
        get buffer() {
            return a.getValue(this._address + 0, "*")
        }
        set buffer(o) {
            a.setValue(this._address + 0, o, "*")
        }
        get processor() {
            return a.getValue(this._address + 4, "*")
        }
        set processor(o) {
            a.setValue(this._address + 4, o, "*")
        }
        get sampleRate() {
            return a.HEAPU32[this._address + 8]
        }
        set sampleRate(o) {
            a.HEAPU32[this._address + 8] = o
        }
        get sampleSize() {
            return a.HEAPU32[this._address + 12]
        }
        set sampleSize(o) {
            a.HEAPU32[this._address + 12] = o
        }
        get channels() {
            return a.HEAPU32[this._address + 16]
        }
        set channels(o) {
            a.HEAPU32[this._address + 16] = o
        }
    }, e.Sound = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.stream = new e.AudioStream(o.stream || {}, this._address + 0), this.frameCount = o.frameCount || 0
        }
        get frameCount() {
            return a.HEAPU32[this._address + 20]
        }
        set frameCount(o) {
            a.HEAPU32[this._address + 20] = o
        }
    }, e.Music = class {
        constructor(o = {}, l) {
            this._size = 33, this._address = l || a._malloc(this._size), this.stream = new e.AudioStream(o.stream || {}, this._address + 0), this.frameCount = o.frameCount || 0, this.looping = o.looping || 0, this.ctxType = o.ctxType || 0, this.ctxData = o.ctxData || 0
        }
        get frameCount() {
            return a.HEAPU32[this._address + 20]
        }
        set frameCount(o) {
            a.HEAPU32[this._address + 20] = o
        }
        get looping() {
            return a.getValue(this._address + 24, "i1")
        }
        set looping(o) {
            a.setValue(this._address + 24, o, "i1")
        }
        get ctxType() {
            return a.getValue(this._address + 25, "i32")
        }
        set ctxType(o) {
            a.setValue(this._address + 25, o, "i32")
        }
        get ctxData() {
            return a.getValue(this._address + 29, "*")
        }
        set ctxData(o) {
            a.setValue(this._address + 29, o, "*")
        }
    }, e.VrDeviceInfo = class {
        constructor(o = {}, l) {
            this._size = 64, this._address = l || a._malloc(this._size), this.hResolution = o.hResolution || 0, this.vResolution = o.vResolution || 0, this.hScreenSize = o.hScreenSize || 0, this.vScreenSize = o.vScreenSize || 0, this.vScreenCenter = o.vScreenCenter || 0, this.eyeToScreenDistance = o.eyeToScreenDistance || 0, this.lensSeparationDistance = o.lensSeparationDistance || 0, this.interpupillaryDistance = o.interpupillaryDistance || 0, this.lensDistortionValues = o.lensDistortionValues || [0, 0, 0, 0], this.chromaAbCorrection = o.chromaAbCorrection || [0, 0, 0, 0]
        }
        get hResolution() {
            return a.getValue(this._address + 0, "i32")
        }
        set hResolution(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get vResolution() {
            return a.getValue(this._address + 4, "i32")
        }
        set vResolution(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get hScreenSize() {
            return a.getValue(this._address + 8, "float")
        }
        set hScreenSize(o) {
            a.setValue(this._address + 8, o, "float")
        }
        get vScreenSize() {
            return a.getValue(this._address + 12, "float")
        }
        set vScreenSize(o) {
            a.setValue(this._address + 12, o, "float")
        }
        get vScreenCenter() {
            return a.getValue(this._address + 16, "float")
        }
        set vScreenCenter(o) {
            a.setValue(this._address + 16, o, "float")
        }
        get eyeToScreenDistance() {
            return a.getValue(this._address + 20, "float")
        }
        set eyeToScreenDistance(o) {
            a.setValue(this._address + 20, o, "float")
        }
        get lensSeparationDistance() {
            return a.getValue(this._address + 24, "float")
        }
        set lensSeparationDistance(o) {
            a.setValue(this._address + 24, o, "float")
        }
        get interpupillaryDistance() {
            return a.getValue(this._address + 28, "float")
        }
        set interpupillaryDistance(o) {
            a.setValue(this._address + 28, o, "float")
        }
        get lensDistortionValues() {
            return a.getValue(this._address + 32, "*")
        }
        set lensDistortionValues(o) {
            a.setValue(this._address + 32, o, "*")
        }
        get chromaAbCorrection() {
            return a.getValue(this._address + 48, "*")
        }
        set chromaAbCorrection(o) {
            a.setValue(this._address + 48, o, "*")
        }
    }, e.VrStereoConfig = class {
        constructor(o = {}, l) {
            this._size = 304, this._address = l || a._malloc(this._size), this.projection = o.projection || [new e.Matrix, new e.Matrix], this.viewOffset = o.viewOffset || [new e.Matrix, new e.Matrix], this.leftLensCenter = o.leftLensCenter || [0, 0], this.rightLensCenter = o.rightLensCenter || [0, 0], this.leftScreenCenter = o.leftScreenCenter || [0, 0], this.rightScreenCenter = o.rightScreenCenter || [0, 0], this.scale = o.scale || [0, 0], this.scaleIn = o.scaleIn || [0, 0]
        }
        get projection() {
            return a.getValue(this._address + 0, "*")
        }
        set projection(o) {
            a.setValue(this._address + 0, o, "*")
        }
        get viewOffset() {
            return a.getValue(this._address + 128, "*")
        }
        set viewOffset(o) {
            a.setValue(this._address + 128, o, "*")
        }
        get leftLensCenter() {
            return a.getValue(this._address + 256, "*")
        }
        set leftLensCenter(o) {
            a.setValue(this._address + 256, o, "*")
        }
        get rightLensCenter() {
            return a.getValue(this._address + 264, "*")
        }
        set rightLensCenter(o) {
            a.setValue(this._address + 264, o, "*")
        }
        get leftScreenCenter() {
            return a.getValue(this._address + 272, "*")
        }
        set leftScreenCenter(o) {
            a.setValue(this._address + 272, o, "*")
        }
        get rightScreenCenter() {
            return a.getValue(this._address + 280, "*")
        }
        set rightScreenCenter(o) {
            a.setValue(this._address + 280, o, "*")
        }
        get scale() {
            return a.getValue(this._address + 288, "*")
        }
        set scale(o) {
            a.setValue(this._address + 288, o, "*")
        }
        get scaleIn() {
            return a.getValue(this._address + 296, "*")
        }
        set scaleIn(o) {
            a.setValue(this._address + 296, o, "*")
        }
    }, e.FilePathList = class {
        constructor(o = {}, l) {
            this._size = 12, this._address = l || a._malloc(this._size), this.capacity = o.capacity || 0, this.count = o.count || 0, this.paths = o.paths || 0
        }
        get capacity() {
            return a.HEAPU32[this._address + 0]
        }
        set capacity(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get count() {
            return a.HEAPU32[this._address + 4]
        }
        set count(o) {
            a.HEAPU32[this._address + 4] = o
        }
        get paths() {
            return a.getValue(this._address + 8, "*")
        }
        set paths(o) {
            a.setValue(this._address + 8, o, "*")
        }
    }, e.Texture2D = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.width = o.width || 0, this.height = o.height || 0, this.mipmaps = o.mipmaps || 0, this.format = o.format || 0
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get width() {
            return a.getValue(this._address + 4, "i32")
        }
        set width(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get height() {
            return a.getValue(this._address + 8, "i32")
        }
        set height(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get mipmaps() {
            return a.getValue(this._address + 12, "i32")
        }
        set mipmaps(o) {
            a.setValue(this._address + 12, o, "i32")
        }
        get format() {
            return a.getValue(this._address + 16, "i32")
        }
        set format(o) {
            a.setValue(this._address + 16, o, "i32")
        }
    }, e.GuiStyleProp = class {
        constructor(o = {}, l) {
            this._size = 4, this._address = l || a._malloc(this._size), this.controlId = o.controlId || 0, this.propertyId = o.propertyId || 0, this.propertyValue = o.propertyValue || 0
        }
        get controlId() {
            return a.getValue(this._address + 0, "*")
        }
        set controlId(o) {
            a.setValue(this._address + 0, o, "*")
        }
        get propertyId() {
            return a.getValue(this._address + 0, "*")
        }
        set propertyId(o) {
            a.setValue(this._address + 0, o, "*")
        }
        get propertyValue() {
            return a.getValue(this._address + 0, "i32")
        }
        set propertyValue(o) {
            a.setValue(this._address + 0, o, "i32")
        }
    }, e.GuiTextStyle = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.size = o.size || 0, this.charSpacing = o.charSpacing || 0, this.lineSpacing = o.lineSpacing || 0, this.alignmentH = o.alignmentH || 0, this.alignmentV = o.alignmentV || 0, this.padding = o.padding || 0
        }
        get size() {
            return a.HEAPU32[this._address + 0]
        }
        set size(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get charSpacing() {
            return a.getValue(this._address + 4, "i32")
        }
        set charSpacing(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get lineSpacing() {
            return a.getValue(this._address + 8, "i32")
        }
        set lineSpacing(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get alignmentH() {
            return a.getValue(this._address + 12, "i32")
        }
        set alignmentH(o) {
            a.setValue(this._address + 12, o, "i32")
        }
        get alignmentV() {
            return a.getValue(this._address + 16, "i32")
        }
        set alignmentV(o) {
            a.setValue(this._address + 16, o, "i32")
        }
        get padding() {
            return a.getValue(this._address + 20, "i32")
        }
        set padding(o) {
            a.setValue(this._address + 20, o, "i32")
        }
    }, e.float3 = class {
        constructor(o = {}, l) {
            this._size = 12, this._address = l || a._malloc(this._size), this.v = o.v || [0, 0, 0]
        }
        get v() {
            return a.getValue(this._address + 0, "*")
        }
        set v(o) {
            a.setValue(this._address + 0, o, "*")
        }
    }, e.float16 = class {
        constructor(o = {}, l) {
            this._size = 64, this._address = l || a._malloc(this._size), this.v = o.v || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
        get v() {
            return a.getValue(this._address + 0, "*")
        }
        set v(o) {
            a.setValue(this._address + 0, o, "*")
        }
    }, e.rlVertexBuffer = class {
        constructor(o = {}, l) {
            this._size = 48, this._address = l || a._malloc(this._size), this.elementCount = o.elementCount || 0, this.vertices = o.vertices || 0, this.texcoords = o.texcoords || 0, this.colors = o.colors || 0, this.indices = o.indices || 0, this.indices = o.indices || 0, this.indices = o.indices || 0, this.indices = o.indices || 0, this.indices = o.indices || 0, this.vaoId = o.vaoId || 0, this.vaoId = o.vaoId || 0, this.vboId = o.vboId || [0, 0, 0, 0]
        }
        get elementCount() {
            return a.getValue(this._address + 0, "i32")
        }
        set elementCount(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get vertices() {
            return a.getValue(this._address + 4, "*")
        }
        set vertices(o) {
            a.setValue(this._address + 4, o, "*")
        }
        get texcoords() {
            return a.getValue(this._address + 8, "*")
        }
        set texcoords(o) {
            a.setValue(this._address + 8, o, "*")
        }
        get colors() {
            return a.getValue(this._address + 12, "*")
        }
        set colors(o) {
            a.setValue(this._address + 12, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 16, "*")
        }
        set indices(o) {
            a.setValue(this._address + 16, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 20, "*")
        }
        set indices(o) {
            a.setValue(this._address + 20, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 24, "*")
        }
        set indices(o) {
            a.setValue(this._address + 24, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 24, "*")
        }
        set indices(o) {
            a.setValue(this._address + 24, o, "*")
        }
        get indices() {
            return a.getValue(this._address + 24, "*")
        }
        set indices(o) {
            a.setValue(this._address + 24, o, "*")
        }
        get vaoId() {
            return a.getValue(this._address + 28, "*")
        }
        set vaoId(o) {
            a.setValue(this._address + 28, o, "*")
        }
        get vaoId() {
            return a.HEAPU32[this._address + 28]
        }
        set vaoId(o) {
            a.HEAPU32[this._address + 28] = o
        }
        get vboId() {
            return a.getValue(this._address + 32, "*")
        }
        set vboId(o) {
            a.setValue(this._address + 32, o, "*")
        }
    }, e.rlDrawCall = class {
        constructor(o = {}, l) {
            this._size = 16, this._address = l || a._malloc(this._size), this.mode = o.mode || 0, this.vertexCount = o.vertexCount || 0, this.vertexAlignment = o.vertexAlignment || 0, this.textureId = o.textureId || 0
        }
        get mode() {
            return a.getValue(this._address + 0, "i32")
        }
        set mode(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get vertexCount() {
            return a.getValue(this._address + 4, "i32")
        }
        set vertexCount(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get vertexAlignment() {
            return a.getValue(this._address + 8, "i32")
        }
        set vertexAlignment(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get textureId() {
            return a.HEAPU32[this._address + 12]
        }
        set textureId(o) {
            a.HEAPU32[this._address + 12] = o
        }
    }, e.rlRenderBatch = class {
        constructor(o = {}, l) {
            this._size = 24, this._address = l || a._malloc(this._size), this.bufferCount = o.bufferCount || 0, this.currentBuffer = o.currentBuffer || 0, this.vertexBuffer = new e.rlVertexBuffer(o.vertexBuffer || {}, this._address + 8), this.draws = new e.rlDrawCall(o.draws || {}, this._address + 12), this.drawCounter = o.drawCounter || 0, this.currentDepth = o.currentDepth || 0
        }
        get bufferCount() {
            return a.getValue(this._address + 0, "i32")
        }
        set bufferCount(o) {
            a.setValue(this._address + 0, o, "i32")
        }
        get currentBuffer() {
            return a.getValue(this._address + 4, "i32")
        }
        set currentBuffer(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get drawCounter() {
            return a.getValue(this._address + 16, "i32")
        }
        set drawCounter(o) {
            a.setValue(this._address + 16, o, "i32")
        }
        get currentDepth() {
            return a.getValue(this._address + 20, "float")
        }
        set currentDepth(o) {
            a.setValue(this._address + 20, o, "float")
        }
    }, e.Quaternion = class {
        constructor(o = {}, l) {
            this._size = 16, this._address = l || a._malloc(this._size), this.x = o.x || 0, this.y = o.y || 0, this.z = o.z || 0, this.w = o.w || 0
        }
        get x() {
            return a.getValue(this._address + 0, "float")
        }
        set x(o) {
            a.setValue(this._address + 0, o, "float")
        }
        get y() {
            return a.getValue(this._address + 4, "float")
        }
        set y(o) {
            a.setValue(this._address + 4, o, "float")
        }
        get z() {
            return a.getValue(this._address + 8, "float")
        }
        set z(o) {
            a.setValue(this._address + 8, o, "float")
        }
        get w() {
            return a.getValue(this._address + 12, "float")
        }
        set w(o) {
            a.setValue(this._address + 12, o, "float")
        }
    }, e.TextureCubemap = class {
        constructor(o = {}, l) {
            this._size = 20, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.width = o.width || 0, this.height = o.height || 0, this.mipmaps = o.mipmaps || 0, this.format = o.format || 0
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
        get width() {
            return a.getValue(this._address + 4, "i32")
        }
        set width(o) {
            a.setValue(this._address + 4, o, "i32")
        }
        get height() {
            return a.getValue(this._address + 8, "i32")
        }
        set height(o) {
            a.setValue(this._address + 8, o, "i32")
        }
        get mipmaps() {
            return a.getValue(this._address + 12, "i32")
        }
        set mipmaps(o) {
            a.setValue(this._address + 12, o, "i32")
        }
        get format() {
            return a.getValue(this._address + 16, "i32")
        }
        set format(o) {
            a.setValue(this._address + 16, o, "i32")
        }
    }, e.RenderTexture2D = class {
        constructor(o = {}, l) {
            this._size = 44, this._address = l || a._malloc(this._size), this.id = o.id || 0, this.texture = new e.Texture(o.texture || {}, this._address + 4), this.depth = new e.Texture(o.depth || {}, this._address + 24)
        }
        get id() {
            return a.HEAPU32[this._address + 0]
        }
        set id(o) {
            a.HEAPU32[this._address + 0] = o
        }
    }, e.Camera = class {
        constructor(o = {}, l) {
            this._size = 44, this._address = l || a._malloc(this._size), this.position = new e.Vector3(o.position || {}, this._address + 0), this.target = new e.Vector3(o.target || {}, this._address + 12), this.up = new e.Vector3(o.up || {}, this._address + 24), this.fovy = o.fovy || 0, this.projection = o.projection || 0
        }
        get fovy() {
            return a.getValue(this._address + 36, "float")
        }
        set fovy(o) {
            a.setValue(this._address + 36, o, "float")
        }
        get projection() {
            return a.getValue(this._address + 40, "i32")
        }
        set projection(o) {
            a.setValue(this._address + 40, o, "i32")
        }
    }, e.FLAG_VSYNC_HINT = 64, e.FLAG_FULLSCREEN_MODE = 2, e.FLAG_WINDOW_RESIZABLE = 4, e.FLAG_WINDOW_UNDECORATED = 8, e.FLAG_WINDOW_HIDDEN = 128, e.FLAG_WINDOW_MINIMIZED = 512, e.FLAG_WINDOW_MAXIMIZED = 1024, e.FLAG_WINDOW_UNFOCUSED = 2048, e.FLAG_WINDOW_TOPMOST = 4096, e.FLAG_WINDOW_ALWAYS_RUN = 256, e.FLAG_WINDOW_TRANSPARENT = 16, e.FLAG_WINDOW_HIGHDPI = 8192, e.FLAG_WINDOW_MOUSE_PASSTHROUGH = 16384, e.FLAG_BORDERLESS_WINDOWED_MODE = 32768, e.FLAG_MSAA_4X_HINT = 32, e.FLAG_INTERLACED_HINT = 65536, e.LOG_ALL = 0, e.LOG_TRACE = 1, e.LOG_DEBUG = 2, e.LOG_INFO = 3, e.LOG_WARNING = 4, e.LOG_ERROR = 5, e.LOG_FATAL = 6, e.LOG_NONE = 7, e.KEY_NULL = 0, e.KEY_APOSTROPHE = 39, e.KEY_COMMA = 44, e.KEY_MINUS = 45, e.KEY_PERIOD = 46, e.KEY_SLASH = 47, e.KEY_ZERO = 48, e.KEY_ONE = 49, e.KEY_TWO = 50, e.KEY_THREE = 51, e.KEY_FOUR = 52, e.KEY_FIVE = 53, e.KEY_SIX = 54, e.KEY_SEVEN = 55, e.KEY_EIGHT = 56, e.KEY_NINE = 57, e.KEY_SEMICOLON = 59, e.KEY_EQUAL = 61, e.KEY_A = 65, e.KEY_B = 66, e.KEY_C = 67, e.KEY_D = 68, e.KEY_E = 69, e.KEY_F = 70, e.KEY_G = 71, e.KEY_H = 72, e.KEY_I = 73, e.KEY_J = 74, e.KEY_K = 75, e.KEY_L = 76, e.KEY_M = 77, e.KEY_N = 78, e.KEY_O = 79, e.KEY_P = 80, e.KEY_Q = 81, e.KEY_R = 82, e.KEY_S = 83, e.KEY_T = 84, e.KEY_U = 85, e.KEY_V = 86, e.KEY_W = 87, e.KEY_X = 88, e.KEY_Y = 89, e.KEY_Z = 90, e.KEY_LEFT_BRACKET = 91, e.KEY_BACKSLASH = 92, e.KEY_RIGHT_BRACKET = 93, e.KEY_GRAVE = 96, e.KEY_SPACE = 32, e.KEY_ESCAPE = 256, e.KEY_ENTER = 257, e.KEY_TAB = 258, e.KEY_BACKSPACE = 259, e.KEY_INSERT = 260, e.KEY_DELETE = 261, e.KEY_RIGHT = 262, e.KEY_LEFT = 263, e.KEY_DOWN = 264, e.KEY_UP = 265, e.KEY_PAGE_UP = 266, e.KEY_PAGE_DOWN = 267, e.KEY_HOME = 268, e.KEY_END = 269, e.KEY_CAPS_LOCK = 280, e.KEY_SCROLL_LOCK = 281, e.KEY_NUM_LOCK = 282, e.KEY_PRINT_SCREEN = 283, e.KEY_PAUSE = 284, e.KEY_F1 = 290, e.KEY_F2 = 291, e.KEY_F3 = 292, e.KEY_F4 = 293, e.KEY_F5 = 294, e.KEY_F6 = 295, e.KEY_F7 = 296, e.KEY_F8 = 297, e.KEY_F9 = 298, e.KEY_F10 = 299, e.KEY_F11 = 300, e.KEY_F12 = 301, e.KEY_LEFT_SHIFT = 340, e.KEY_LEFT_CONTROL = 341, e.KEY_LEFT_ALT = 342, e.KEY_LEFT_SUPER = 343, e.KEY_RIGHT_SHIFT = 344, e.KEY_RIGHT_CONTROL = 345, e.KEY_RIGHT_ALT = 346, e.KEY_RIGHT_SUPER = 347, e.KEY_KB_MENU = 348, e.KEY_KP_0 = 320, e.KEY_KP_1 = 321, e.KEY_KP_2 = 322, e.KEY_KP_3 = 323, e.KEY_KP_4 = 324, e.KEY_KP_5 = 325, e.KEY_KP_6 = 326, e.KEY_KP_7 = 327, e.KEY_KP_8 = 328, e.KEY_KP_9 = 329, e.KEY_KP_DECIMAL = 330, e.KEY_KP_DIVIDE = 331, e.KEY_KP_MULTIPLY = 332, e.KEY_KP_SUBTRACT = 333, e.KEY_KP_ADD = 334, e.KEY_KP_ENTER = 335, e.KEY_KP_EQUAL = 336, e.KEY_BACK = 4, e.KEY_MENU = 82, e.KEY_VOLUME_UP = 24, e.KEY_VOLUME_DOWN = 25, e.MOUSE_BUTTON_LEFT = 0, e.MOUSE_BUTTON_RIGHT = 1, e.MOUSE_BUTTON_MIDDLE = 2, e.MOUSE_BUTTON_SIDE = 3, e.MOUSE_BUTTON_EXTRA = 4, e.MOUSE_BUTTON_FORWARD = 5, e.MOUSE_BUTTON_BACK = 6, e.MOUSE_CURSOR_DEFAULT = 0, e.MOUSE_CURSOR_ARROW = 1, e.MOUSE_CURSOR_IBEAM = 2, e.MOUSE_CURSOR_CROSSHAIR = 3, e.MOUSE_CURSOR_POINTING_HAND = 4, e.MOUSE_CURSOR_RESIZE_EW = 5, e.MOUSE_CURSOR_RESIZE_NS = 6, e.MOUSE_CURSOR_RESIZE_NWSE = 7, e.MOUSE_CURSOR_RESIZE_NESW = 8, e.MOUSE_CURSOR_RESIZE_ALL = 9, e.MOUSE_CURSOR_NOT_ALLOWED = 10, e.GAMEPAD_BUTTON_UNKNOWN = 0, e.GAMEPAD_BUTTON_LEFT_FACE_UP = 1, e.GAMEPAD_BUTTON_LEFT_FACE_RIGHT = 2, e.GAMEPAD_BUTTON_LEFT_FACE_DOWN = 3, e.GAMEPAD_BUTTON_LEFT_FACE_LEFT = 4, e.GAMEPAD_BUTTON_RIGHT_FACE_UP = 5, e.GAMEPAD_BUTTON_RIGHT_FACE_RIGHT = 6, e.GAMEPAD_BUTTON_RIGHT_FACE_DOWN = 7, e.GAMEPAD_BUTTON_RIGHT_FACE_LEFT = 8, e.GAMEPAD_BUTTON_LEFT_TRIGGER_1 = 9, e.GAMEPAD_BUTTON_LEFT_TRIGGER_2 = 10, e.GAMEPAD_BUTTON_RIGHT_TRIGGER_1 = 11, e.GAMEPAD_BUTTON_RIGHT_TRIGGER_2 = 12, e.GAMEPAD_BUTTON_MIDDLE_LEFT = 13, e.GAMEPAD_BUTTON_MIDDLE = 14, e.GAMEPAD_BUTTON_MIDDLE_RIGHT = 15, e.GAMEPAD_BUTTON_LEFT_THUMB = 16, e.GAMEPAD_BUTTON_RIGHT_THUMB = 17, e.GAMEPAD_AXIS_LEFT_X = 0, e.GAMEPAD_AXIS_LEFT_Y = 1, e.GAMEPAD_AXIS_RIGHT_X = 2, e.GAMEPAD_AXIS_RIGHT_Y = 3, e.GAMEPAD_AXIS_LEFT_TRIGGER = 4, e.GAMEPAD_AXIS_RIGHT_TRIGGER = 5, e.MATERIAL_MAP_ALBEDO = 0, e.MATERIAL_MAP_METALNESS = 1, e.MATERIAL_MAP_NORMAL = 2, e.MATERIAL_MAP_ROUGHNESS = 3, e.MATERIAL_MAP_OCCLUSION = 4, e.MATERIAL_MAP_EMISSION = 5, e.MATERIAL_MAP_HEIGHT = 6, e.MATERIAL_MAP_CUBEMAP = 7, e.MATERIAL_MAP_IRRADIANCE = 8, e.MATERIAL_MAP_PREFILTER = 9, e.MATERIAL_MAP_BRDF = 10, e.SHADER_LOC_VERTEX_POSITION = 0, e.SHADER_LOC_VERTEX_TEXCOORD01 = 1, e.SHADER_LOC_VERTEX_TEXCOORD02 = 2, e.SHADER_LOC_VERTEX_NORMAL = 3, e.SHADER_LOC_VERTEX_TANGENT = 4, e.SHADER_LOC_VERTEX_COLOR = 5, e.SHADER_LOC_MATRIX_MVP = 6, e.SHADER_LOC_MATRIX_VIEW = 7, e.SHADER_LOC_MATRIX_PROJECTION = 8, e.SHADER_LOC_MATRIX_MODEL = 9, e.SHADER_LOC_MATRIX_NORMAL = 10, e.SHADER_LOC_VECTOR_VIEW = 11, e.SHADER_LOC_COLOR_DIFFUSE = 12, e.SHADER_LOC_COLOR_SPECULAR = 13, e.SHADER_LOC_COLOR_AMBIENT = 14, e.SHADER_LOC_MAP_ALBEDO = 15, e.SHADER_LOC_MAP_METALNESS = 16, e.SHADER_LOC_MAP_NORMAL = 17, e.SHADER_LOC_MAP_ROUGHNESS = 18, e.SHADER_LOC_MAP_OCCLUSION = 19, e.SHADER_LOC_MAP_EMISSION = 20, e.SHADER_LOC_MAP_HEIGHT = 21, e.SHADER_LOC_MAP_CUBEMAP = 22, e.SHADER_LOC_MAP_IRRADIANCE = 23, e.SHADER_LOC_MAP_PREFILTER = 24, e.SHADER_LOC_MAP_BRDF = 25, e.SHADER_UNIFORM_FLOAT = 0, e.SHADER_UNIFORM_VEC2 = 1, e.SHADER_UNIFORM_VEC3 = 2, e.SHADER_UNIFORM_VEC4 = 3, e.SHADER_UNIFORM_INT = 4, e.SHADER_UNIFORM_IVEC2 = 5, e.SHADER_UNIFORM_IVEC3 = 6, e.SHADER_UNIFORM_IVEC4 = 7, e.SHADER_UNIFORM_SAMPLER2D = 8, e.SHADER_ATTRIB_FLOAT = 0, e.SHADER_ATTRIB_VEC2 = 1, e.SHADER_ATTRIB_VEC3 = 2, e.SHADER_ATTRIB_VEC4 = 3, e.PIXELFORMAT_UNCOMPRESSED_GRAYSCALE = 1, e.PIXELFORMAT_UNCOMPRESSED_GRAY_ALPHA = 2, e.PIXELFORMAT_UNCOMPRESSED_R5G6B5 = 3, e.PIXELFORMAT_UNCOMPRESSED_R8G8B8 = 4, e.PIXELFORMAT_UNCOMPRESSED_R5G5B5A1 = 5, e.PIXELFORMAT_UNCOMPRESSED_R4G4B4A4 = 6, e.PIXELFORMAT_UNCOMPRESSED_R8G8B8A8 = 7, e.PIXELFORMAT_UNCOMPRESSED_R32 = 8, e.PIXELFORMAT_UNCOMPRESSED_R32G32B32 = 9, e.PIXELFORMAT_UNCOMPRESSED_R32G32B32A32 = 10, e.PIXELFORMAT_UNCOMPRESSED_R16 = 11, e.PIXELFORMAT_UNCOMPRESSED_R16G16B16 = 12, e.PIXELFORMAT_UNCOMPRESSED_R16G16B16A16 = 13, e.PIXELFORMAT_COMPRESSED_DXT1_RGB = 14, e.PIXELFORMAT_COMPRESSED_DXT1_RGBA = 15, e.PIXELFORMAT_COMPRESSED_DXT3_RGBA = 16, e.PIXELFORMAT_COMPRESSED_DXT5_RGBA = 17, e.PIXELFORMAT_COMPRESSED_ETC1_RGB = 18, e.PIXELFORMAT_COMPRESSED_ETC2_RGB = 19, e.PIXELFORMAT_COMPRESSED_ETC2_EAC_RGBA = 20, e.PIXELFORMAT_COMPRESSED_PVRT_RGB = 21, e.PIXELFORMAT_COMPRESSED_PVRT_RGBA = 22, e.PIXELFORMAT_COMPRESSED_ASTC_4x4_RGBA = 23, e.PIXELFORMAT_COMPRESSED_ASTC_8x8_RGBA = 24, e.TEXTURE_FILTER_POINT = 0, e.TEXTURE_FILTER_BILINEAR = 1, e.TEXTURE_FILTER_TRILINEAR = 2, e.TEXTURE_FILTER_ANISOTROPIC_4X = 3, e.TEXTURE_FILTER_ANISOTROPIC_8X = 4, e.TEXTURE_FILTER_ANISOTROPIC_16X = 5, e.TEXTURE_WRAP_REPEAT = 0, e.TEXTURE_WRAP_CLAMP = 1, e.TEXTURE_WRAP_MIRROR_REPEAT = 2, e.TEXTURE_WRAP_MIRROR_CLAMP = 3, e.CUBEMAP_LAYOUT_AUTO_DETECT = 0, e.CUBEMAP_LAYOUT_LINE_VERTICAL = 1, e.CUBEMAP_LAYOUT_LINE_HORIZONTAL = 2, e.CUBEMAP_LAYOUT_CROSS_THREE_BY_FOUR = 3, e.CUBEMAP_LAYOUT_CROSS_FOUR_BY_THREE = 4, e.CUBEMAP_LAYOUT_PANORAMA = 5, e.FONT_DEFAULT = 0, e.FONT_BITMAP = 1, e.FONT_SDF = 2, e.BLEND_ALPHA = 0, e.BLEND_ADDITIVE = 1, e.BLEND_MULTIPLIED = 2, e.BLEND_ADD_COLORS = 3, e.BLEND_SUBTRACT_COLORS = 4, e.BLEND_ALPHA_PREMULTIPLY = 5, e.BLEND_CUSTOM = 6, e.BLEND_CUSTOM_SEPARATE = 7, e.GESTURE_NONE = 0, e.GESTURE_TAP = 1, e.GESTURE_DOUBLETAP = 2, e.GESTURE_HOLD = 4, e.GESTURE_DRAG = 8, e.GESTURE_SWIPE_RIGHT = 16, e.GESTURE_SWIPE_LEFT = 32, e.GESTURE_SWIPE_UP = 64, e.GESTURE_SWIPE_DOWN = 128, e.GESTURE_PINCH_IN = 256, e.GESTURE_PINCH_OUT = 512, e.CAMERA_CUSTOM = 0, e.CAMERA_FREE = 1, e.CAMERA_ORBITAL = 2, e.CAMERA_FIRST_PERSON = 3, e.CAMERA_THIRD_PERSON = 4, e.CAMERA_PERSPECTIVE = 0, e.CAMERA_ORTHOGRAPHIC = 1, e.NPATCH_NINE_PATCH = 0, e.NPATCH_THREE_PATCH_VERTICAL = 1, e.NPATCH_THREE_PATCH_HORIZONTAL = 2, e.STATE_NORMAL = 0, e.STATE_FOCUSED = 1, e.STATE_PRESSED = 2, e.STATE_DISABLED = 3, e.TEXT_ALIGN_LEFT = 0, e.TEXT_ALIGN_CENTER = 1, e.TEXT_ALIGN_RIGHT = 2, e.TEXT_ALIGN_TOP = 0, e.TEXT_ALIGN_MIDDLE = 1, e.TEXT_ALIGN_BOTTOM = 2, e.TEXT_WRAP_NONE = 0, e.TEXT_WRAP_CHAR = 1, e.TEXT_WRAP_WORD = 2, e.DEFAULT = 0, e.LABEL = 1, e.BUTTON = 2, e.TOGGLE = 3, e.SLIDER = 4, e.PROGRESSBAR = 5, e.CHECKBOX = 6, e.COMBOBOX = 7, e.DROPDOWNBOX = 8, e.TEXTBOX = 9, e.VALUEBOX = 10, e.SPINNER = 11, e.LISTVIEW = 12, e.COLORPICKER = 13, e.SCROLLBAR = 14, e.STATUSBAR = 15, e.BORDER_COLOR_NORMAL = 0, e.BASE_COLOR_NORMAL = 1, e.TEXT_COLOR_NORMAL = 2, e.BORDER_COLOR_FOCUSED = 3, e.BASE_COLOR_FOCUSED = 4, e.TEXT_COLOR_FOCUSED = 5, e.BORDER_COLOR_PRESSED = 6, e.BASE_COLOR_PRESSED = 7, e.TEXT_COLOR_PRESSED = 8, e.BORDER_COLOR_DISABLED = 9, e.BASE_COLOR_DISABLED = 10, e.TEXT_COLOR_DISABLED = 11, e.BORDER_WIDTH = 12, e.TEXT_PADDING = 13, e.TEXT_ALIGNMENT = 14, e.TEXT_SIZE = 16, e.TEXT_SPACING = 17, e.LINE_COLOR = 18, e.BACKGROUND_COLOR = 19, e.TEXT_LINE_SPACING = 20, e.TEXT_ALIGNMENT_VERTICAL = 21, e.TEXT_WRAP_MODE = 22, e.GROUP_PADDING = 16, e.SLIDER_WIDTH = 16, e.SLIDER_PADDING = 17, e.PROGRESS_PADDING = 16, e.ARROWS_SIZE = 16, e.ARROWS_VISIBLE = 17, e.SCROLL_SLIDER_PADDING = 18, e.SCROLL_SLIDER_SIZE = 19, e.SCROLL_PADDING = 20, e.SCROLL_SPEED = 21, e.CHECK_PADDING = 16, e.COMBO_BUTTON_WIDTH = 16, e.COMBO_BUTTON_SPACING = 17, e.ARROW_PADDING = 16, e.DROPDOWN_ITEMS_SPACING = 17, e.TEXT_READONLY = 16, e.SPIN_BUTTON_WIDTH = 16, e.SPIN_BUTTON_SPACING = 17, e.LIST_ITEMS_HEIGHT = 16, e.LIST_ITEMS_SPACING = 17, e.SCROLLBAR_WIDTH = 18, e.SCROLLBAR_SIDE = 19, e.COLOR_SELECTOR_SIZE = 16, e.HUEBAR_WIDTH = 17, e.HUEBAR_PADDING = 18, e.HUEBAR_SELECTOR_HEIGHT = 19, e.HUEBAR_SELECTOR_OVERFLOW = 20, e.ICON_NONE = 0, e.ICON_FOLDER_FILE_OPEN = 1, e.ICON_FILE_SAVE_CLASSIC = 2, e.ICON_FOLDER_OPEN = 3, e.ICON_FOLDER_SAVE = 4, e.ICON_FILE_OPEN = 5, e.ICON_FILE_SAVE = 6, e.ICON_FILE_EXPORT = 7, e.ICON_FILE_ADD = 8, e.ICON_FILE_DELETE = 9, e.ICON_FILETYPE_TEXT = 10, e.ICON_FILETYPE_AUDIO = 11, e.ICON_FILETYPE_IMAGE = 12, e.ICON_FILETYPE_PLAY = 13, e.ICON_FILETYPE_VIDEO = 14, e.ICON_FILETYPE_INFO = 15, e.ICON_FILE_COPY = 16, e.ICON_FILE_CUT = 17, e.ICON_FILE_PASTE = 18, e.ICON_CURSOR_HAND = 19, e.ICON_CURSOR_POINTER = 20, e.ICON_CURSOR_CLASSIC = 21, e.ICON_PENCIL = 22, e.ICON_PENCIL_BIG = 23, e.ICON_BRUSH_CLASSIC = 24, e.ICON_BRUSH_PAINTER = 25, e.ICON_WATER_DROP = 26, e.ICON_COLOR_PICKER = 27, e.ICON_RUBBER = 28, e.ICON_COLOR_BUCKET = 29, e.ICON_TEXT_T = 30, e.ICON_TEXT_A = 31, e.ICON_SCALE = 32, e.ICON_RESIZE = 33, e.ICON_FILTER_POINT = 34, e.ICON_FILTER_BILINEAR = 35, e.ICON_CROP = 36, e.ICON_CROP_ALPHA = 37, e.ICON_SQUARE_TOGGLE = 38, e.ICON_SYMMETRY = 39, e.ICON_SYMMETRY_HORIZONTAL = 40, e.ICON_SYMMETRY_VERTICAL = 41, e.ICON_LENS = 42, e.ICON_LENS_BIG = 43, e.ICON_EYE_ON = 44, e.ICON_EYE_OFF = 45, e.ICON_FILTER_TOP = 46, e.ICON_FILTER = 47, e.ICON_TARGET_POINT = 48, e.ICON_TARGET_SMALL = 49, e.ICON_TARGET_BIG = 50, e.ICON_TARGET_MOVE = 51, e.ICON_CURSOR_MOVE = 52, e.ICON_CURSOR_SCALE = 53, e.ICON_CURSOR_SCALE_RIGHT = 54, e.ICON_CURSOR_SCALE_LEFT = 55, e.ICON_UNDO = 56, e.ICON_REDO = 57, e.ICON_REREDO = 58, e.ICON_MUTATE = 59, e.ICON_ROTATE = 60, e.ICON_REPEAT = 61, e.ICON_SHUFFLE = 62, e.ICON_EMPTYBOX = 63, e.ICON_TARGET = 64, e.ICON_TARGET_SMALL_FILL = 65, e.ICON_TARGET_BIG_FILL = 66, e.ICON_TARGET_MOVE_FILL = 67, e.ICON_CURSOR_MOVE_FILL = 68, e.ICON_CURSOR_SCALE_FILL = 69, e.ICON_CURSOR_SCALE_RIGHT_FILL = 70, e.ICON_CURSOR_SCALE_LEFT_FILL = 71, e.ICON_UNDO_FILL = 72, e.ICON_REDO_FILL = 73, e.ICON_REREDO_FILL = 74, e.ICON_MUTATE_FILL = 75, e.ICON_ROTATE_FILL = 76, e.ICON_REPEAT_FILL = 77, e.ICON_SHUFFLE_FILL = 78, e.ICON_EMPTYBOX_SMALL = 79, e.ICON_BOX = 80, e.ICON_BOX_TOP = 81, e.ICON_BOX_TOP_RIGHT = 82, e.ICON_BOX_RIGHT = 83, e.ICON_BOX_BOTTOM_RIGHT = 84, e.ICON_BOX_BOTTOM = 85, e.ICON_BOX_BOTTOM_LEFT = 86, e.ICON_BOX_LEFT = 87, e.ICON_BOX_TOP_LEFT = 88, e.ICON_BOX_CENTER = 89, e.ICON_BOX_CIRCLE_MASK = 90, e.ICON_POT = 91, e.ICON_ALPHA_MULTIPLY = 92, e.ICON_ALPHA_CLEAR = 93, e.ICON_DITHERING = 94, e.ICON_MIPMAPS = 95, e.ICON_BOX_GRID = 96, e.ICON_GRID = 97, e.ICON_BOX_CORNERS_SMALL = 98, e.ICON_BOX_CORNERS_BIG = 99, e.ICON_FOUR_BOXES = 100, e.ICON_GRID_FILL = 101, e.ICON_BOX_MULTISIZE = 102, e.ICON_ZOOM_SMALL = 103, e.ICON_ZOOM_MEDIUM = 104, e.ICON_ZOOM_BIG = 105, e.ICON_ZOOM_ALL = 106, e.ICON_ZOOM_CENTER = 107, e.ICON_BOX_DOTS_SMALL = 108, e.ICON_BOX_DOTS_BIG = 109, e.ICON_BOX_CONCENTRIC = 110, e.ICON_BOX_GRID_BIG = 111, e.ICON_OK_TICK = 112, e.ICON_CROSS = 113, e.ICON_ARROW_LEFT = 114, e.ICON_ARROW_RIGHT = 115, e.ICON_ARROW_DOWN = 116, e.ICON_ARROW_UP = 117, e.ICON_ARROW_LEFT_FILL = 118, e.ICON_ARROW_RIGHT_FILL = 119, e.ICON_ARROW_DOWN_FILL = 120, e.ICON_ARROW_UP_FILL = 121, e.ICON_AUDIO = 122, e.ICON_FX = 123, e.ICON_WAVE = 124, e.ICON_WAVE_SINUS = 125, e.ICON_WAVE_SQUARE = 126, e.ICON_WAVE_TRIANGULAR = 127, e.ICON_CROSS_SMALL = 128, e.ICON_PLAYER_PREVIOUS = 129, e.ICON_PLAYER_PLAY_BACK = 130, e.ICON_PLAYER_PLAY = 131, e.ICON_PLAYER_PAUSE = 132, e.ICON_PLAYER_STOP = 133, e.ICON_PLAYER_NEXT = 134, e.ICON_PLAYER_RECORD = 135, e.ICON_MAGNET = 136, e.ICON_LOCK_CLOSE = 137, e.ICON_LOCK_OPEN = 138, e.ICON_CLOCK = 139, e.ICON_TOOLS = 140, e.ICON_GEAR = 141, e.ICON_GEAR_BIG = 142, e.ICON_BIN = 143, e.ICON_HAND_POINTER = 144, e.ICON_LASER = 145, e.ICON_COIN = 146, e.ICON_EXPLOSION = 147, e.ICON_1UP = 148, e.ICON_PLAYER = 149, e.ICON_PLAYER_JUMP = 150, e.ICON_KEY = 151, e.ICON_DEMON = 152, e.ICON_TEXT_POPUP = 153, e.ICON_GEAR_EX = 154, e.ICON_CRACK = 155, e.ICON_CRACK_POINTS = 156, e.ICON_STAR = 157, e.ICON_DOOR = 158, e.ICON_EXIT = 159, e.ICON_MODE_2D = 160, e.ICON_MODE_3D = 161, e.ICON_CUBE = 162, e.ICON_CUBE_FACE_TOP = 163, e.ICON_CUBE_FACE_LEFT = 164, e.ICON_CUBE_FACE_FRONT = 165, e.ICON_CUBE_FACE_BOTTOM = 166, e.ICON_CUBE_FACE_RIGHT = 167, e.ICON_CUBE_FACE_BACK = 168, e.ICON_CAMERA = 169, e.ICON_SPECIAL = 170, e.ICON_LINK_NET = 171, e.ICON_LINK_BOXES = 172, e.ICON_LINK_MULTI = 173, e.ICON_LINK = 174, e.ICON_LINK_BROKE = 175, e.ICON_TEXT_NOTES = 176, e.ICON_NOTEBOOK = 177, e.ICON_SUITCASE = 178, e.ICON_SUITCASE_ZIP = 179, e.ICON_MAILBOX = 180, e.ICON_MONITOR = 181, e.ICON_PRINTER = 182, e.ICON_PHOTO_CAMERA = 183, e.ICON_PHOTO_CAMERA_FLASH = 184, e.ICON_HOUSE = 185, e.ICON_HEART = 186, e.ICON_CORNER = 187, e.ICON_VERTICAL_BARS = 188, e.ICON_VERTICAL_BARS_FILL = 189, e.ICON_LIFE_BARS = 190, e.ICON_INFO = 191, e.ICON_CROSSLINE = 192, e.ICON_HELP = 193, e.ICON_FILETYPE_ALPHA = 194, e.ICON_FILETYPE_HOME = 195, e.ICON_LAYERS_VISIBLE = 196, e.ICON_LAYERS = 197, e.ICON_WINDOW = 198, e.ICON_HIDPI = 199, e.ICON_FILETYPE_BINARY = 200, e.ICON_HEX = 201, e.ICON_SHIELD = 202, e.ICON_FILE_NEW = 203, e.ICON_FOLDER_ADD = 204, e.ICON_ALARM = 205, e.ICON_CPU = 206, e.ICON_ROM = 207, e.ICON_STEP_OVER = 208, e.ICON_STEP_INTO = 209, e.ICON_STEP_OUT = 210, e.ICON_RESTART = 211, e.ICON_BREAKPOINT_ON = 212, e.ICON_BREAKPOINT_OFF = 213, e.ICON_BURGER_MENU = 214, e.ICON_CASE_SENSITIVE = 215, e.ICON_REG_EXP = 216, e.ICON_FOLDER = 217, e.ICON_FILE = 218, e.ICON_SAND_TIMER = 219, e.ICON_220 = 220, e.ICON_221 = 221, e.ICON_222 = 222, e.ICON_223 = 223, e.ICON_224 = 224, e.ICON_225 = 225, e.ICON_226 = 226, e.ICON_227 = 227, e.ICON_228 = 228, e.ICON_229 = 229, e.ICON_230 = 230, e.ICON_231 = 231, e.ICON_232 = 232, e.ICON_233 = 233, e.ICON_234 = 234, e.ICON_235 = 235, e.ICON_236 = 236, e.ICON_237 = 237, e.ICON_238 = 238, e.ICON_239 = 239, e.ICON_240 = 240, e.ICON_241 = 241, e.ICON_242 = 242, e.ICON_243 = 243, e.ICON_244 = 244, e.ICON_245 = 245, e.ICON_246 = 246, e.ICON_247 = 247, e.ICON_248 = 248, e.ICON_249 = 249, e.ICON_250 = 250, e.ICON_251 = 251, e.ICON_252 = 252, e.ICON_253 = 253, e.ICON_254 = 254, e.ICON_255 = 255, e.RL_OPENGL_11 = 1, e.RL_OPENGL_21 = 2, e.RL_OPENGL_33 = 3, e.RL_OPENGL_43 = 4, e.RL_OPENGL_ES_20 = 5, e.RL_OPENGL_ES_30 = 6, e.RL_LOG_ALL = 0, e.RL_LOG_TRACE = 1, e.RL_LOG_DEBUG = 2, e.RL_LOG_INFO = 3, e.RL_LOG_WARNING = 4, e.RL_LOG_ERROR = 5, e.RL_LOG_FATAL = 6, e.RL_LOG_NONE = 7, e.RL_PIXELFORMAT_UNCOMPRESSED_GRAYSCALE = 1, e.RL_PIXELFORMAT_UNCOMPRESSED_GRAY_ALPHA = 2, e.RL_PIXELFORMAT_UNCOMPRESSED_R5G6B5 = 3, e.RL_PIXELFORMAT_UNCOMPRESSED_R8G8B8 = 4, e.RL_PIXELFORMAT_UNCOMPRESSED_R5G5B5A1 = 5, e.RL_PIXELFORMAT_UNCOMPRESSED_R4G4B4A4 = 6, e.RL_PIXELFORMAT_UNCOMPRESSED_R8G8B8A8 = 7, e.RL_PIXELFORMAT_UNCOMPRESSED_R32 = 8, e.RL_PIXELFORMAT_UNCOMPRESSED_R32G32B32 = 9, e.RL_PIXELFORMAT_UNCOMPRESSED_R32G32B32A32 = 10, e.RL_PIXELFORMAT_UNCOMPRESSED_R16 = 11, e.RL_PIXELFORMAT_UNCOMPRESSED_R16G16B16 = 12, e.RL_PIXELFORMAT_UNCOMPRESSED_R16G16B16A16 = 13, e.RL_PIXELFORMAT_COMPRESSED_DXT1_RGB = 14, e.RL_PIXELFORMAT_COMPRESSED_DXT1_RGBA = 15, e.RL_PIXELFORMAT_COMPRESSED_DXT3_RGBA = 16, e.RL_PIXELFORMAT_COMPRESSED_DXT5_RGBA = 17, e.RL_PIXELFORMAT_COMPRESSED_ETC1_RGB = 18, e.RL_PIXELFORMAT_COMPRESSED_ETC2_RGB = 19, e.RL_PIXELFORMAT_COMPRESSED_ETC2_EAC_RGBA = 20, e.RL_PIXELFORMAT_COMPRESSED_PVRT_RGB = 21, e.RL_PIXELFORMAT_COMPRESSED_PVRT_RGBA = 22, e.RL_PIXELFORMAT_COMPRESSED_ASTC_4x4_RGBA = 23, e.RL_PIXELFORMAT_COMPRESSED_ASTC_8x8_RGBA = 24, e.RL_TEXTURE_FILTER_POINT = 0, e.RL_TEXTURE_FILTER_BILINEAR = 1, e.RL_TEXTURE_FILTER_TRILINEAR = 2, e.RL_TEXTURE_FILTER_ANISOTROPIC_4X = 3, e.RL_TEXTURE_FILTER_ANISOTROPIC_8X = 4, e.RL_TEXTURE_FILTER_ANISOTROPIC_16X = 5, e.RL_BLEND_ALPHA = 0, e.RL_BLEND_ADDITIVE = 1, e.RL_BLEND_MULTIPLIED = 2, e.RL_BLEND_ADD_COLORS = 3, e.RL_BLEND_SUBTRACT_COLORS = 4, e.RL_BLEND_ALPHA_PREMULTIPLY = 5, e.RL_BLEND_CUSTOM = 6, e.RL_BLEND_CUSTOM_SEPARATE = 7, e.RL_SHADER_LOC_VERTEX_POSITION = 0, e.RL_SHADER_LOC_VERTEX_TEXCOORD01 = 1, e.RL_SHADER_LOC_VERTEX_TEXCOORD02 = 2, e.RL_SHADER_LOC_VERTEX_NORMAL = 3, e.RL_SHADER_LOC_VERTEX_TANGENT = 4, e.RL_SHADER_LOC_VERTEX_COLOR = 5, e.RL_SHADER_LOC_MATRIX_MVP = 6, e.RL_SHADER_LOC_MATRIX_VIEW = 7, e.RL_SHADER_LOC_MATRIX_PROJECTION = 8, e.RL_SHADER_LOC_MATRIX_MODEL = 9, e.RL_SHADER_LOC_MATRIX_NORMAL = 10, e.RL_SHADER_LOC_VECTOR_VIEW = 11, e.RL_SHADER_LOC_COLOR_DIFFUSE = 12, e.RL_SHADER_LOC_COLOR_SPECULAR = 13, e.RL_SHADER_LOC_COLOR_AMBIENT = 14, e.RL_SHADER_LOC_MAP_ALBEDO = 15, e.RL_SHADER_LOC_MAP_METALNESS = 16, e.RL_SHADER_LOC_MAP_NORMAL = 17, e.RL_SHADER_LOC_MAP_ROUGHNESS = 18, e.RL_SHADER_LOC_MAP_OCCLUSION = 19, e.RL_SHADER_LOC_MAP_EMISSION = 20, e.RL_SHADER_LOC_MAP_HEIGHT = 21, e.RL_SHADER_LOC_MAP_CUBEMAP = 22, e.RL_SHADER_LOC_MAP_IRRADIANCE = 23, e.RL_SHADER_LOC_MAP_PREFILTER = 24, e.RL_SHADER_LOC_MAP_BRDF = 25, e.RL_SHADER_UNIFORM_FLOAT = 0, e.RL_SHADER_UNIFORM_VEC2 = 1, e.RL_SHADER_UNIFORM_VEC3 = 2, e.RL_SHADER_UNIFORM_VEC4 = 3, e.RL_SHADER_UNIFORM_INT = 4, e.RL_SHADER_UNIFORM_IVEC2 = 5, e.RL_SHADER_UNIFORM_IVEC3 = 6, e.RL_SHADER_UNIFORM_IVEC4 = 7, e.RL_SHADER_UNIFORM_SAMPLER2D = 8, e.RL_SHADER_ATTRIB_FLOAT = 0, e.RL_SHADER_ATTRIB_VEC2 = 1, e.RL_SHADER_ATTRIB_VEC3 = 2, e.RL_SHADER_ATTRIB_VEC4 = 3, e.RL_ATTACHMENT_COLOR_CHANNEL0 = 0, e.RL_ATTACHMENT_COLOR_CHANNEL1 = 1, e.RL_ATTACHMENT_COLOR_CHANNEL2 = 2, e.RL_ATTACHMENT_COLOR_CHANNEL3 = 3, e.RL_ATTACHMENT_COLOR_CHANNEL4 = 4, e.RL_ATTACHMENT_COLOR_CHANNEL5 = 5, e.RL_ATTACHMENT_COLOR_CHANNEL6 = 6, e.RL_ATTACHMENT_COLOR_CHANNEL7 = 7, e.RL_ATTACHMENT_DEPTH = 100, e.RL_ATTACHMENT_STENCIL = 200, e.RL_ATTACHMENT_CUBEMAP_POSITIVE_X = 0, e.RL_ATTACHMENT_CUBEMAP_NEGATIVE_X = 1, e.RL_ATTACHMENT_CUBEMAP_POSITIVE_Y = 2, e.RL_ATTACHMENT_CUBEMAP_NEGATIVE_Y = 3, e.RL_ATTACHMENT_CUBEMAP_POSITIVE_Z = 4, e.RL_ATTACHMENT_CUBEMAP_NEGATIVE_Z = 5, e.RL_ATTACHMENT_TEXTURE2D = 100, e.RL_ATTACHMENT_RENDERBUFFER = 200, e.RL_CULL_FACE_FRONT = 0, e.RL_CULL_FACE_BACK = 1,
    e.LIGHTGRAY = new e.Color({
        r: 200,
        g: 200,
        b: 200,
        a: 255
    }), e.GRAY = new e.Color({
        r: 130,
        g: 130,
        b: 130,
        a: 255
    }), e.DARKGRAY = new e.Color({
        r: 80,
        g: 80,
        b: 80,
        a: 255
    }), e.YELLOW = new e.Color({
        r: 253,
        g: 249,
        b: 0,
        a: 255
    }), e.GOLD = new e.Color({
        r: 255,
        g: 203,
        b: 0,
        a: 255
    }), e.ORANGE = new e.Color({
        r: 255,
        g: 161,
        b: 0,
        a: 255
    }), e.PINK = new e.Color({
        r: 255,
        g: 109,
        b: 194,
        a: 255
    }), e.RED = new e.Color({
        r: 230,
        g: 41,
        b: 55,
        a: 255
    }), e.MAROON = new e.Color({
        r: 190,
        g: 33,
        b: 55,
        a: 255
    }), e.GREEN = new e.Color({
        r: 0,
        g: 228,
        b: 48,
        a: 255
    }), e.LIME = new e.Color({
        r: 0,
        g: 158,
        b: 47,
        a: 255
    }), e.DARKGREEN = new e.Color({
        r: 0,
        g: 117,
        b: 44,
        a: 255
    }), e.SKYBLUE = new e.Color({
        r: 102,
        g: 191,
        b: 255,
        a: 255
    }), e.BLUE = new e.Color({
        r: 0,
        g: 121,
        b: 241,
        a: 255
    }), e.DARKBLUE = new e.Color({
        r: 0,
        g: 82,
        b: 172,
        a: 255
    }), e.PURPLE = new e.Color({
        r: 200,
        g: 122,
        b: 255,
        a: 255
    }), e.VIOLET = new e.Color({
        r: 135,
        g: 60,
        b: 190,
        a: 255
    }), e.DARKPURPLE = new e.Color({
        r: 112,
        g: 31,
        b: 126,
        a: 255
    }), e.BEIGE = new e.Color({
        r: 211,
        g: 176,
        b: 131,
        a: 255
    }), e.BROWN = new e.Color({
        r: 127,
        g: 106,
        b: 79,
        a: 255
    }), e.DARKBROWN = new e.Color({
        r: 76,
        g: 63,
        b: 47,
        a: 255
    }), e.WHITE = new e.Color({
        r: 255,
        g: 255,
        b: 255,
        a: 255
    }), e.BLACK = new e.Color({
        r: 0,
        g: 0,
        b: 0,
        a: 255
    }), e.BLANK = new e.Color({
        r: 0,
        g: 0,
        b: 0,
        a: 0
    }), e.MAGENTA = new e.Color({
        r: 255,
        g: 0,
        b: 255,
        a: 255
    }), e.RAYWHITE = new e.Color({
        r: 245,
        g: 245,
        b: 245,
        a: 255
    });
    const _ = a.cwrap("InitWindow", "pointer", ["number", "number", "string"]);
    e.InitWindow = (s, o, l) => _(s, o, l);
    const u = a.cwrap("CloseWindow", "pointer", []);
    e.CloseWindow = () => u();
    const c = a.cwrap("WindowShouldClose", "boolean", []);
    e.WindowShouldClose = () => c();
    const m = a.cwrap("IsWindowReady", "boolean", []);
    e.IsWindowReady = () => m();
    const M = a.cwrap("IsWindowFullscreen", "boolean", []);
    e.IsWindowFullscreen = () => M();
    const S = a.cwrap("IsWindowResized", "boolean", []);
    e.IsWindowResized = () => S();
    const L = a.cwrap("IsWindowState", "boolean", ["number"]);
    e.IsWindowState = s => L(s);
    const R = a.cwrap("ClearWindowState", "pointer", ["number"]);
    e.ClearWindowState = s => R(s);
    const C = a.cwrap("SetWindowMonitor", "pointer", ["number"]);
    e.SetWindowMonitor = s => C(s);
    const I = a.cwrap("SetWindowMinSize", "pointer", ["number", "number"]);
    e.SetWindowMinSize = (s, o) => I(s, o);
    const T = a.cwrap("SetWindowMaxSize", "pointer", ["number", "number"]);
    e.SetWindowMaxSize = (s, o) => T(s, o);
    const w = a.cwrap("SetWindowSize", "pointer", ["number", "number"]);
    e.SetWindowSize = (s, o) => w(s, o);
    const A = a.cwrap("GetWindowHandle", "pointer", []);
    e.GetWindowHandle = () => A();
    const h = a.cwrap("GetScreenWidth", "number", []);
    e.GetScreenWidth = () => h();
    const G = a.cwrap("GetScreenHeight", "number", []);
    e.GetScreenHeight = () => G();
    const O = a.cwrap("GetRenderWidth", "number", []);
    e.GetRenderWidth = () => O();
    const D = a.cwrap("GetRenderHeight", "number", []);
    e.GetRenderHeight = () => D();
    const f = a.cwrap("GetMonitorCount", "number", []);
    e.GetMonitorCount = () => f();
    const g = a.cwrap("GetCurrentMonitor", "number", []);
    e.GetCurrentMonitor = () => g();
    const y = a.cwrap("GetMonitorPosition", "void", ["pointer", "number"]);
    e.GetMonitorPosition = s => {
        const o = new e.Vector2;
        return y(o._address, s), o
    };
    const N = a.cwrap("GetMonitorWidth", "number", ["number"]);
    e.GetMonitorWidth = s => N(s);
    const v = a.cwrap("GetMonitorHeight", "number", ["number"]);
    e.GetMonitorHeight = s => v(s);
    const B = a.cwrap("GetMonitorPhysicalWidth", "number", ["number"]);
    e.GetMonitorPhysicalWidth = s => B(s);
    const V = a.cwrap("GetMonitorPhysicalHeight", "number", ["number"]);
    e.GetMonitorPhysicalHeight = s => V(s);
    const U = a.cwrap("GetMonitorRefreshRate", "number", ["number"]);
    e.GetMonitorRefreshRate = s => U(s);
    const H = a.cwrap("GetWindowPosition", "void", ["pointer"]);
    e.GetWindowPosition = () => {
        const s = new e.Vector2;
        return H(s._address), s
    };
    const W = a.cwrap("GetWindowScaleDPI", "void", ["pointer"]);
    e.GetWindowScaleDPI = () => {
        const s = new e.Vector2;
        return W(s._address), s
    };
    const k = a.cwrap("GetMonitorName", "string", ["number"]);
    e.GetMonitorName = s => k(s);
    const X = a.cwrap("SetClipboardText", "pointer", ["string"]);
    e.SetClipboardText = s => X(s);
    const Y = a.cwrap("GetClipboardText", "string", []);
    e.GetClipboardText = () => Y();
    const K = a.cwrap("EnableEventWaiting", "pointer", []);
    e.EnableEventWaiting = () => K();
    const z = a.cwrap("DisableEventWaiting", "pointer", []);
    e.DisableEventWaiting = () => z();
    const Q = a.cwrap("SwapScreenBuffer", "pointer", []);
    e.SwapScreenBuffer = () => Q();
    const q = a.cwrap("PollInputEvents", "pointer", []);
    e.PollInputEvents = () => q();
    const j = a.cwrap("WaitTime", "pointer", ["number"]);
    e.WaitTime = s => j(s);
    const Z = a.cwrap("ShowCursor", "pointer", []);
    e.ShowCursor = () => Z();
    const J = a.cwrap("HideCursor", "pointer", []);
    e.HideCursor = () => J();
    const $ = a.cwrap("IsCursorHidden", "boolean", []);
    e.IsCursorHidden = () => $();
    const e1 = a.cwrap("EnableCursor", "pointer", []);
    e.EnableCursor = () => e1();
    const r1 = a.cwrap("DisableCursor", "pointer", []);
    e.DisableCursor = () => r1();
    const t1 = a.cwrap("IsCursorOnScreen", "boolean", []);
    e.IsCursorOnScreen = () => t1();
    const a1 = a.cwrap("ClearBackground", "pointer", ["pointer"]);
    e.ClearBackground = s => a1(s._address);
    const o1 = a.cwrap("BeginDrawing", "pointer", []);
    e.BeginDrawing = () => o1();
    const n1 = a.cwrap("EndDrawing", "pointer", []);
    e.EndDrawing = () => n1();
    const s1 = a.cwrap("BeginMode2D", "pointer", ["pointer"]);
    e.BeginMode2D = s => s1(s._address);
    const i1 = a.cwrap("EndMode2D", "pointer", []);
    e.EndMode2D = () => i1();
    const l1 = a.cwrap("BeginMode3D", "pointer", ["pointer"]);
    e.BeginMode3D = s => l1(s._address);
    const _1 = a.cwrap("EndMode3D", "pointer", []);
    e.EndMode3D = () => _1();
    const d1 = a.cwrap("BeginTextureMode", "pointer", ["pointer"]);
    e.BeginTextureMode = s => d1(s._address);
    const u1 = a.cwrap("EndTextureMode", "pointer", []);
    e.EndTextureMode = () => u1();
    const c1 = a.cwrap("BeginShaderMode", "pointer", ["pointer"]);
    e.BeginShaderMode = s => c1(s._address);
    const E1 = a.cwrap("EndShaderMode", "pointer", []);
    e.EndShaderMode = () => E1();
    const m1 = a.cwrap("BeginBlendMode", "pointer", ["number"]);
    e.BeginBlendMode = s => m1(s);
    const p1 = a.cwrap("EndBlendMode", "pointer", []);
    e.EndBlendMode = () => p1();
    const M1 = a.cwrap("BeginScissorMode", "pointer", ["number", "number", "number", "number"]);
    e.BeginScissorMode = (s, o, l, d) => M1(s, o, l, d);
    const S1 = a.cwrap("EndScissorMode", "pointer", []);
    e.EndScissorMode = () => S1();
    const C1 = a.cwrap("BeginVrStereoMode", "pointer", ["pointer"]);
    e.BeginVrStereoMode = s => C1(s._address);
    const R1 = a.cwrap("EndVrStereoMode", "pointer", []);
    e.EndVrStereoMode = () => R1();
    const L1 = a.cwrap("LoadVrStereoConfig", "void", ["pointer", "pointer"]);
    e.LoadVrStereoConfig = s => {
        const o = new e.VrStereoConfig;
        return L1(o._address, s._address), o
    };
    const I1 = a.cwrap("UnloadVrStereoConfig", "pointer", ["pointer"]);
    e.UnloadVrStereoConfig = s => I1(s._address);
    const T1 = a.cwrap("LoadShader", "void", ["pointer", "string", "string"]);
    e.LoadShader = (s, o) => {
        const l = new e.Shader;
        return T1(l._address, s, o), l
    };
    const b1 = a.cwrap("LoadShaderFromMemory", "void", ["pointer", "string", "string"]);
    e.LoadShaderFromMemory = (s, o) => {
        const l = new e.Shader;
        return b1(l._address, s, o), l
    };
    const A1 = a.cwrap("IsShaderReady", "boolean", ["pointer"]);
    e.IsShaderReady = s => A1(s._address);
    const w1 = a.cwrap("GetShaderLocation", "number", ["pointer", "string"]);
    e.GetShaderLocation = (s, o) => w1(s._address, o);
    const O1 = a.cwrap("GetShaderLocationAttrib", "number", ["pointer", "string"]);
    e.GetShaderLocationAttrib = (s, o) => O1(s._address, o);
    const g1 = a.cwrap("SetShaderValue", "pointer", ["pointer", "number", "pointer", "number"]);
    e.SetShaderValue = (s, o, l, d) => g1(s._address, o, l._address, d);
    const G1 = a.cwrap("SetShaderValueV", "pointer", ["pointer", "number", "pointer", "number", "number"]);
    e.SetShaderValueV = (s, o, l, d, E) => G1(s._address, o, l._address, d, E);
    const D1 = a.cwrap("SetShaderValueMatrix", "pointer", ["pointer", "number", "pointer"]);
    e.SetShaderValueMatrix = (s, o, l) => D1(s._address, o, l._address);
    const h1 = a.cwrap("SetShaderValueTexture", "pointer", ["pointer", "number", "pointer"]);
    e.SetShaderValueTexture = (s, o, l) => h1(s._address, o, l._address);
    const f1 = a.cwrap("UnloadShader", "pointer", ["pointer"]);
    e.UnloadShader = s => f1(s._address);
    const x1 = a.cwrap("GetMouseRay", "void", ["pointer", "pointer", "pointer"]);
    e.GetMouseRay = (s, o) => {
        const l = new e.Ray;
        return x1(l._address, s._address, o._address), l
    };
    const y1 = a.cwrap("GetCameraMatrix", "void", ["pointer", "pointer"]);
    e.GetCameraMatrix = s => {
        const o = new e.Matrix;
        return y1(o._address, s._address), o
    };
    const P1 = a.cwrap("GetCameraMatrix2D", "void", ["pointer", "pointer"]);
    e.GetCameraMatrix2D = s => {
        const o = new e.Matrix;
        return P1(o._address, s._address), o
    };
    const F1 = a.cwrap("GetWorldToScreen", "void", ["pointer", "pointer", "pointer"]);
    e.GetWorldToScreen = (s, o) => {
        const l = new e.Vector2;
        return F1(l._address, s._address, o._address), l
    };
    const N1 = a.cwrap("GetScreenToWorld2D", "void", ["pointer", "pointer", "pointer"]);
    e.GetScreenToWorld2D = (s, o) => {
        const l = new e.Vector2;
        return N1(l._address, s._address, o._address), l
    };
    const v1 = a.cwrap("GetWorldToScreenEx", "void", ["pointer", "pointer", "pointer", "number", "number"]);
    e.GetWorldToScreenEx = (s, o, l, d) => {
        const E = new e.Vector2;
        return v1(E._address, s._address, o._address, l, d), E
    };
    const B1 = a.cwrap("GetWorldToScreen2D", "void", ["pointer", "pointer", "pointer"]);
    e.GetWorldToScreen2D = (s, o) => {
        const l = new e.Vector2;
        return B1(l._address, s._address, o._address), l
    };
    const V1 = a.cwrap("SetTargetFPS", "pointer", ["number"]);
    e.SetTargetFPS = s => V1(s);
    const U1 = a.cwrap("GetFPS", "number", []);
    e.GetFPS = () => U1();
    const H1 = a.cwrap("GetFrameTime", "number", []);
    e.GetFrameTime = () => H1();
    const W1 = a.cwrap("GetTime", "number", []);
    e.GetTime = () => W1();
    const k1 = a.cwrap("GetRandomValue", "number", ["number", "number"]);
    e.GetRandomValue = (s, o) => k1(s, o);
    const X1 = a.cwrap("SetRandomSeed", "pointer", ["number"]);
    e.SetRandomSeed = s => X1(s);
    const Y1 = a.cwrap("TakeScreenshot", "pointer", ["string"]);
    e.TakeScreenshot = s => Y1(s);
    const K1 = a.cwrap("SetConfigFlags", "pointer", ["number"]);
    e.SetConfigFlags = s => K1(s);
    const z1 = a.cwrap("TraceLog", "pointer", ["number", "string", "pointer"]);
    e.TraceLog = (s, o, l) => z1(s, o, l._address);
    const Q1 = a.cwrap("SetTraceLogLevel", "pointer", ["number"]);
    e.SetTraceLogLevel = s => Q1(s);
    const q1 = a.cwrap("MemAlloc", "pointer", ["number"]);
    e.MemAlloc = s => q1(s);
    const j1 = a.cwrap("MemRealloc", "pointer", ["pointer", "number"]);
    e.MemRealloc = (s, o) => j1(s._address, o);
    const Z1 = a.cwrap("MemFree", "pointer", ["pointer"]);
    e.MemFree = s => Z1(s._address);
    const J1 = a.cwrap("OpenURL", "pointer", ["string"]);
    e.OpenURL = s => J1(s);
    const $1 = a.cwrap("SetTraceLogCallback", "pointer", ["pointer"]);
    e.SetTraceLogCallback = s => $1(s._address);
    const e2 = a.cwrap("SetLoadFileDataCallback", "pointer", ["pointer"]);
    e.SetLoadFileDataCallback = s => e2(s._address);
    const r2 = a.cwrap("SetSaveFileDataCallback", "pointer", ["pointer"]);
    e.SetSaveFileDataCallback = s => r2(s._address);
    const t2 = a.cwrap("SetLoadFileTextCallback", "pointer", ["pointer"]);
    e.SetLoadFileTextCallback = s => t2(s._address);
    const a2 = a.cwrap("SetSaveFileTextCallback", "pointer", ["pointer"]);
    e.SetSaveFileTextCallback = s => a2(s._address);
    const o2 = a.cwrap("LoadFileData", "pointer", ["string", "pointer"]);
    e.LoadFileData = async (s, o) => (await e.addFile(s), o2(s, o._address));
    const n2 = a.cwrap("UnloadFileData", "pointer", ["pointer"]);
    e.UnloadFileData = s => n2(s._address);
    const s2 = a.cwrap("SaveFileData", "boolean", ["string", "pointer", "number"]);
    e.SaveFileData = (s, o, l) => s2(s, o._address, l);
    const i2 = a.cwrap("ExportDataAsCode", "boolean", ["pointer", "number", "string"]);
    e.ExportDataAsCode = (s, o, l) => i2(s._address, o, l);
    const l2 = a.cwrap("LoadFileText", "string", ["string"]);
    e.LoadFileText = async s => (await e.addFile(s), l2(s));
    const _2 = a.cwrap("UnloadFileText", "pointer", ["string"]);
    e.UnloadFileText = s => _2(s);
    const d2 = a.cwrap("SaveFileText", "boolean", ["string", "string"]);
    e.SaveFileText = (s, o) => d2(s, o);
    const u2 = a.cwrap("FileExists", "boolean", ["string"]);
    e.FileExists = s => u2(s);
    const c2 = a.cwrap("DirectoryExists", "boolean", ["string"]);
    e.DirectoryExists = s => c2(s);
    const E2 = a.cwrap("IsFileExtension", "boolean", ["string", "string"]);
    e.IsFileExtension = (s, o) => E2(s, o);
    const m2 = a.cwrap("GetFileLength", "number", ["string"]);
    e.GetFileLength = s => m2(s);
    const p2 = a.cwrap("GetFileExtension", "string", ["string"]);
    e.GetFileExtension = s => p2(s);
    const M2 = a.cwrap("GetFileName", "string", ["string"]);
    e.GetFileName = s => M2(s);
    const S2 = a.cwrap("GetFileNameWithoutExt", "string", ["string"]);
    e.GetFileNameWithoutExt = s => S2(s);
    const C2 = a.cwrap("GetDirectoryPath", "string", ["string"]);
    e.GetDirectoryPath = s => C2(s);
    const R2 = a.cwrap("GetPrevDirectoryPath", "string", ["string"]);
    e.GetPrevDirectoryPath = s => R2(s);
    const L2 = a.cwrap("GetWorkingDirectory", "string", []);
    e.GetWorkingDirectory = () => L2();
    const I2 = a.cwrap("GetApplicationDirectory", "string", []);
    e.GetApplicationDirectory = () => I2();
    const T2 = a.cwrap("ChangeDirectory", "boolean", ["string"]);
    e.ChangeDirectory = s => T2(s);
    const b2 = a.cwrap("IsPathFile", "boolean", ["string"]);
    e.IsPathFile = s => b2(s);
    const A2 = a.cwrap("LoadDirectoryFiles", "void", ["pointer", "string"]);
    e.LoadDirectoryFiles = s => {
        const o = new e.FilePathList;
        return A2(o._address, s), o
    };
    const w2 = a.cwrap("LoadDirectoryFilesEx", "void", ["pointer", "string", "string", "boolean"]);
    e.LoadDirectoryFilesEx = (s, o, l) => {
        const d = new e.FilePathList;
        return w2(d._address, s, o, l), d
    };
    const O2 = a.cwrap("UnloadDirectoryFiles", "pointer", ["pointer"]);
    e.UnloadDirectoryFiles = s => O2(s._address);
    const g2 = a.cwrap("IsFileDropped", "boolean", []);
    e.IsFileDropped = () => g2();
    const G2 = a.cwrap("LoadDroppedFiles", "void", ["pointer"]);
    e.LoadDroppedFiles = () => {
        const s = new e.FilePathList;
        return G2(s._address), s
    };
    const D2 = a.cwrap("UnloadDroppedFiles", "pointer", ["pointer"]);
    e.UnloadDroppedFiles = s => D2(s._address);
    const h2 = a.cwrap("GetFileModTime", "number", ["string"]);
    e.GetFileModTime = s => h2(s);
    const f2 = a.cwrap("CompressData", "pointer", ["pointer", "number", "pointer"]);
    e.CompressData = (s, o, l) => f2(s._address, o, l._address);
    const x2 = a.cwrap("DecompressData", "pointer", ["pointer", "number", "pointer"]);
    e.DecompressData = (s, o, l) => x2(s._address, o, l._address);
    const y2 = a.cwrap("EncodeDataBase64", "string", ["pointer", "number", "pointer"]);
    e.EncodeDataBase64 = (s, o, l) => y2(s._address, o, l._address);
    const P2 = a.cwrap("DecodeDataBase64", "pointer", ["pointer", "pointer"]);
    e.DecodeDataBase64 = (s, o) => P2(s._address, o._address);
    const F2 = a.cwrap("IsKeyPressed", "boolean", ["number"]);
    e.IsKeyPressed = s => F2(s);
    const N2 = a.cwrap("IsKeyPressedRepeat", "boolean", ["number"]);
    e.IsKeyPressedRepeat = s => N2(s);
    const v2 = a.cwrap("IsKeyDown", "boolean", ["number"]);
    e.IsKeyDown = s => v2(s);
    const B2 = a.cwrap("IsKeyReleased", "boolean", ["number"]);
    e.IsKeyReleased = s => B2(s);
    const V2 = a.cwrap("IsKeyUp", "boolean", ["number"]);
    e.IsKeyUp = s => V2(s);
    const U2 = a.cwrap("SetExitKey", "pointer", ["number"]);
    e.SetExitKey = s => U2(s);
    const H2 = a.cwrap("GetKeyPressed", "number", []);
    e.GetKeyPressed = () => H2();
    const W2 = a.cwrap("GetCharPressed", "number", []);
    e.GetCharPressed = () => W2();
    const k2 = a.cwrap("IsGamepadAvailable", "boolean", ["number"]);
    e.IsGamepadAvailable = s => k2(s);
    const X2 = a.cwrap("GetGamepadName", "string", ["number"]);
    e.GetGamepadName = s => X2(s);
    const Y2 = a.cwrap("IsGamepadButtonPressed", "boolean", ["number", "number"]);
    e.IsGamepadButtonPressed = (s, o) => Y2(s, o);
    const K2 = a.cwrap("IsGamepadButtonDown", "boolean", ["number", "number"]);
    e.IsGamepadButtonDown = (s, o) => K2(s, o);
    const z2 = a.cwrap("IsGamepadButtonReleased", "boolean", ["number", "number"]);
    e.IsGamepadButtonReleased = (s, o) => z2(s, o);
    const Q2 = a.cwrap("IsGamepadButtonUp", "boolean", ["number", "number"]);
    e.IsGamepadButtonUp = (s, o) => Q2(s, o);
    const q2 = a.cwrap("GetGamepadButtonPressed", "number", []);
    e.GetGamepadButtonPressed = () => q2();
    const j2 = a.cwrap("GetGamepadAxisCount", "number", ["number"]);
    e.GetGamepadAxisCount = s => j2(s);
    const Z2 = a.cwrap("GetGamepadAxisMovement", "number", ["number", "number"]);
    e.GetGamepadAxisMovement = (s, o) => Z2(s, o);
    const J2 = a.cwrap("SetGamepadMappings", "number", ["string"]);
    e.SetGamepadMappings = s => J2(s);
    const $2 = a.cwrap("IsMouseButtonPressed", "boolean", ["number"]);
    e.IsMouseButtonPressed = s => $2(s);
    const e3 = a.cwrap("IsMouseButtonDown", "boolean", ["number"]);
    e.IsMouseButtonDown = s => e3(s);
    const r3 = a.cwrap("IsMouseButtonReleased", "boolean", ["number"]);
    e.IsMouseButtonReleased = s => r3(s);
    const t3 = a.cwrap("IsMouseButtonUp", "boolean", ["number"]);
    e.IsMouseButtonUp = s => t3(s);
    const a3 = a.cwrap("GetMouseX", "number", []);
    e.GetMouseX = () => a3();
    const o3 = a.cwrap("GetMouseY", "number", []);
    e.GetMouseY = () => o3();
    const n3 = a.cwrap("GetMousePosition", "void", ["pointer"]);
    e.GetMousePosition = () => {
        const s = new e.Vector2;
        return n3(s._address), s
    };
    const s3 = a.cwrap("GetMouseDelta", "void", ["pointer"]);
    e.GetMouseDelta = () => {
        const s = new e.Vector2;
        return s3(s._address), s
    };
    const i3 = a.cwrap("SetMousePosition", "pointer", ["number", "number"]);
    e.SetMousePosition = (s, o) => i3(s, o);
    const l3 = a.cwrap("SetMouseOffset", "pointer", ["number", "number"]);
    e.SetMouseOffset = (s, o) => l3(s, o);
    const _3 = a.cwrap("SetMouseScale", "pointer", ["number", "number"]);
    e.SetMouseScale = (s, o) => _3(s, o);
    const d3 = a.cwrap("GetMouseWheelMove", "number", []);
    e.GetMouseWheelMove = () => d3();
    const u3 = a.cwrap("GetMouseWheelMoveV", "void", ["pointer"]);
    e.GetMouseWheelMoveV = () => {
        const s = new e.Vector2;
        return u3(s._address), s
    };
    const c3 = a.cwrap("SetMouseCursor", "pointer", ["number"]);
    e.SetMouseCursor = s => c3(s);
    const E3 = a.cwrap("GetTouchX", "number", []);
    e.GetTouchX = () => E3();
    const m3 = a.cwrap("GetTouchY", "number", []);
    e.GetTouchY = () => m3();
    const p3 = a.cwrap("GetTouchPosition", "void", ["pointer", "number"]);
    e.GetTouchPosition = s => {
        const o = new e.Vector2;
        return p3(o._address, s), o
    };
    const M3 = a.cwrap("GetTouchPointId", "number", ["number"]);
    e.GetTouchPointId = s => M3(s);
    const S3 = a.cwrap("GetTouchPointCount", "number", []);
    e.GetTouchPointCount = () => S3();
    const C3 = a.cwrap("SetGesturesEnabled", "pointer", ["number"]);
    e.SetGesturesEnabled = s => C3(s);
    const R3 = a.cwrap("IsGestureDetected", "boolean", ["number"]);
    e.IsGestureDetected = s => R3(s);
    const L3 = a.cwrap("GetGestureDetected", "number", []);
    e.GetGestureDetected = () => L3();
    const I3 = a.cwrap("GetGestureHoldDuration", "number", []);
    e.GetGestureHoldDuration = () => I3();
    const T3 = a.cwrap("GetGestureDragVector", "void", ["pointer"]);
    e.GetGestureDragVector = () => {
        const s = new e.Vector2;
        return T3(s._address), s
    };
    const b3 = a.cwrap("GetGestureDragAngle", "number", []);
    e.GetGestureDragAngle = () => b3();
    const A3 = a.cwrap("GetGesturePinchVector", "void", ["pointer"]);
    e.GetGesturePinchVector = () => {
        const s = new e.Vector2;
        return A3(s._address), s
    };
    const w3 = a.cwrap("GetGesturePinchAngle", "number", []);
    e.GetGesturePinchAngle = () => w3();
    const O3 = a.cwrap("UpdateCamera", "pointer", ["pointer", "number"]);
    e.UpdateCamera = (s, o) => O3(s._address, o);
    const g3 = a.cwrap("UpdateCameraPro", "pointer", ["pointer", "pointer", "pointer", "number"]);
    e.UpdateCameraPro = (s, o, l, d) => g3(s._address, o._address, l._address, d);
    const G3 = a.cwrap("SetShapesTexture", "pointer", ["pointer", "pointer"]);
    e.SetShapesTexture = (s, o) => G3(s._address, o._address);
    const D3 = a.cwrap("DrawPixel", "pointer", ["number", "number", "pointer"]);
    e.DrawPixel = (s, o, l) => D3(s, o, l._address);
    const h3 = a.cwrap("DrawPixelV", "pointer", ["pointer", "pointer"]);
    e.DrawPixelV = (s, o) => h3(s._address, o._address);
    const f3 = a.cwrap("DrawLine", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.DrawLine = (s, o, l, d, E) => f3(s, o, l, d, E._address);
    const x3 = a.cwrap("DrawLineV", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawLineV = (s, o, l) => x3(s._address, o._address, l._address);
    const y3 = a.cwrap("DrawLineEx", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.DrawLineEx = (s, o, l, d) => y3(s._address, o._address, l, d._address);
    const P3 = a.cwrap("DrawLineBezier", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.DrawLineBezier = (s, o, l, d) => P3(s._address, o._address, l, d._address);
    const F3 = a.cwrap("DrawLineBezierQuad", "pointer", ["pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawLineBezierQuad = (s, o, l, d, E) => F3(s._address, o._address, l._address, d, E._address);
    const N3 = a.cwrap("DrawLineBezierCubic", "pointer", ["pointer", "pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawLineBezierCubic = (s, o, l, d, E, p) => N3(s._address, o._address, l._address, d._address, E, p._address);
    const v3 = a.cwrap("DrawLineBSpline", "pointer", ["pointer", "number", "number", "pointer"]);
    e.DrawLineBSpline = (s, o, l, d) => v3(s._address, o, l, d._address);
    const B3 = a.cwrap("DrawLineCatmullRom", "pointer", ["pointer", "number", "number", "pointer"]);
    e.DrawLineCatmullRom = (s, o, l, d) => B3(s._address, o, l, d._address);
    const V3 = a.cwrap("DrawLineStrip", "pointer", ["pointer", "number", "pointer"]);
    e.DrawLineStrip = (s, o, l) => V3(s._address, o, l._address);
    const U3 = a.cwrap("DrawCircle", "pointer", ["number", "number", "number", "pointer"]);
    e.DrawCircle = (s, o, l, d) => U3(s, o, l, d._address);
    const H3 = a.cwrap("DrawCircleSector", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.DrawCircleSector = (s, o, l, d, E, p) => H3(s._address, o, l, d, E, p._address);
    const W3 = a.cwrap("DrawCircleSectorLines", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.DrawCircleSectorLines = (s, o, l, d, E, p) => W3(s._address, o, l, d, E, p._address);
    const k3 = a.cwrap("DrawCircleGradient", "pointer", ["number", "number", "number", "pointer", "pointer"]);
    e.DrawCircleGradient = (s, o, l, d, E) => k3(s, o, l, d._address, E._address);
    const X3 = a.cwrap("DrawCircleV", "pointer", ["pointer", "number", "pointer"]);
    e.DrawCircleV = (s, o, l) => X3(s._address, o, l._address);
    const Y3 = a.cwrap("DrawCircleLines", "pointer", ["number", "number", "number", "pointer"]);
    e.DrawCircleLines = (s, o, l, d) => Y3(s, o, l, d._address);
    const K3 = a.cwrap("DrawEllipse", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.DrawEllipse = (s, o, l, d, E) => K3(s, o, l, d, E._address);
    const z3 = a.cwrap("DrawEllipseLines", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.DrawEllipseLines = (s, o, l, d, E) => z3(s, o, l, d, E._address);
    const Q3 = a.cwrap("DrawRing", "pointer", ["pointer", "number", "number", "number", "number", "number", "pointer"]);
    e.DrawRing = (s, o, l, d, E, p, b) => Q3(s._address, o, l, d, E, p, b._address);
    const q3 = a.cwrap("DrawRingLines", "pointer", ["pointer", "number", "number", "number", "number", "number", "pointer"]);
    e.DrawRingLines = (s, o, l, d, E, p, b) => q3(s._address, o, l, d, E, p, b._address);
    const j3 = a.cwrap("DrawRectangle", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.DrawRectangle = (s, o, l, d, E) => j3(s, o, l, d, E._address);
    const Z3 = a.cwrap("DrawRectangleV", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawRectangleV = (s, o, l) => Z3(s._address, o._address, l._address);
    const J3 = a.cwrap("DrawRectangleRec", "pointer", ["pointer", "pointer"]);
    e.DrawRectangleRec = (s, o) => J3(s._address, o._address);
    const $3 = a.cwrap("DrawRectanglePro", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.DrawRectanglePro = (s, o, l, d) => $3(s._address, o._address, l, d._address);
    const e6 = a.cwrap("DrawRectangleGradientV", "pointer", ["number", "number", "number", "number", "pointer", "pointer"]);
    e.DrawRectangleGradientV = (s, o, l, d, E, p) => e6(s, o, l, d, E._address, p._address);
    const r6 = a.cwrap("DrawRectangleGradientH", "pointer", ["number", "number", "number", "number", "pointer", "pointer"]);
    e.DrawRectangleGradientH = (s, o, l, d, E, p) => r6(s, o, l, d, E._address, p._address);
    const t6 = a.cwrap("DrawRectangleGradientEx", "pointer", ["pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.DrawRectangleGradientEx = (s, o, l, d, E) => t6(s._address, o._address, l._address, d._address, E._address);
    const a6 = a.cwrap("DrawRectangleLines", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.DrawRectangleLines = (s, o, l, d, E) => a6(s, o, l, d, E._address);
    const o6 = a.cwrap("DrawRectangleLinesEx", "pointer", ["pointer", "number", "pointer"]);
    e.DrawRectangleLinesEx = (s, o, l) => o6(s._address, o, l._address);
    const n6 = a.cwrap("DrawRectangleRounded", "pointer", ["pointer", "number", "number", "pointer"]);
    e.DrawRectangleRounded = (s, o, l, d) => n6(s._address, o, l, d._address);
    const s6 = a.cwrap("DrawRectangleRoundedLines", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawRectangleRoundedLines = (s, o, l, d, E) => s6(s._address, o, l, d, E._address);
    const i6 = a.cwrap("DrawTriangle", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.DrawTriangle = (s, o, l, d) => i6(s._address, o._address, l._address, d._address);
    const l6 = a.cwrap("DrawTriangleLines", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.DrawTriangleLines = (s, o, l, d) => l6(s._address, o._address, l._address, d._address);
    const _6 = a.cwrap("DrawTriangleFan", "pointer", ["pointer", "number", "pointer"]);
    e.DrawTriangleFan = (s, o, l) => _6(s._address, o, l._address);
    const d6 = a.cwrap("DrawTriangleStrip", "pointer", ["pointer", "number", "pointer"]);
    e.DrawTriangleStrip = (s, o, l) => d6(s._address, o, l._address);
    const u6 = a.cwrap("DrawPoly", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawPoly = (s, o, l, d, E) => u6(s._address, o, l, d, E._address);
    const c6 = a.cwrap("DrawPolyLines", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawPolyLines = (s, o, l, d, E) => c6(s._address, o, l, d, E._address);
    const E6 = a.cwrap("DrawPolyLinesEx", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.DrawPolyLinesEx = (s, o, l, d, E, p) => E6(s._address, o, l, d, E, p._address);
    const m6 = a.cwrap("CheckCollisionRecs", "boolean", ["pointer", "pointer"]);
    e.CheckCollisionRecs = (s, o) => m6(s._address, o._address);
    const p6 = a.cwrap("CheckCollisionCircles", "boolean", ["pointer", "number", "pointer", "number"]);
    e.CheckCollisionCircles = (s, o, l, d) => p6(s._address, o, l._address, d);
    const M6 = a.cwrap("CheckCollisionCircleRec", "boolean", ["pointer", "number", "pointer"]);
    e.CheckCollisionCircleRec = (s, o, l) => M6(s._address, o, l._address);
    const S6 = a.cwrap("CheckCollisionPointRec", "boolean", ["pointer", "pointer"]);
    e.CheckCollisionPointRec = (s, o) => S6(s._address, o._address);
    const C6 = a.cwrap("CheckCollisionPointCircle", "boolean", ["pointer", "pointer", "number"]);
    e.CheckCollisionPointCircle = (s, o, l) => C6(s._address, o._address, l);
    const R6 = a.cwrap("CheckCollisionPointTriangle", "boolean", ["pointer", "pointer", "pointer", "pointer"]);
    e.CheckCollisionPointTriangle = (s, o, l, d) => R6(s._address, o._address, l._address, d._address);
    const L6 = a.cwrap("CheckCollisionPointPoly", "boolean", ["pointer", "pointer", "number"]);
    e.CheckCollisionPointPoly = (s, o, l) => L6(s._address, o._address, l);
    const I6 = a.cwrap("CheckCollisionLines", "boolean", ["pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.CheckCollisionLines = (s, o, l, d, E) => I6(s._address, o._address, l._address, d._address, E._address);
    const T6 = a.cwrap("CheckCollisionPointLine", "boolean", ["pointer", "pointer", "pointer", "number"]);
    e.CheckCollisionPointLine = (s, o, l, d) => T6(s._address, o._address, l._address, d);
    const b6 = a.cwrap("GetCollisionRec", "void", ["pointer", "pointer", "pointer"]);
    e.GetCollisionRec = (s, o) => {
        const l = new e.Rectangle;
        return b6(l._address, s._address, o._address), l
    };
    const A6 = a.cwrap("LoadImage", "void", ["pointer", "string"]);
    e.LoadImage = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Image;
        return A6(l._address, s), l
    };
    const w6 = a.cwrap("LoadImageRaw", "void", ["pointer", "string", "number", "number", "number", "number"]);
    e.LoadImageRaw = async (s, o, l, d, E, p) => {
        !p && await e.addFile(s);
        const b = new e.Image;
        return w6(b._address, s, o, l, d, E), b
    };
    const O6 = a.cwrap("LoadImageSvg", "void", ["pointer", "string", "number", "number"]);
    e.LoadImageSvg = (s, o, l) => {
        const d = new e.Image;
        return O6(d._address, s, o, l), d
    };
    const g6 = a.cwrap("LoadImageAnim", "void", ["pointer", "string", "pointer"]);
    e.LoadImageAnim = async (s, o, l) => {
        !l && await e.addFile(s);
        const d = new e.Image;
        return g6(d._address, s, o._address), d
    };
    const G6 = a.cwrap("LoadImageFromMemory", "void", ["pointer", "string", "pointer", "number"]);
    e.LoadImageFromMemory = (s, o, l) => {
        const d = new e.Image;
        return G6(d._address, s, o._address, l), d
    };
    const D6 = a.cwrap("LoadImageFromTexture", "void", ["pointer", "pointer"]);
    e.LoadImageFromTexture = s => {
        const o = new e.Image;
        return D6(o._address, s._address), o
    };
    const h6 = a.cwrap("LoadImageFromScreen", "void", ["pointer"]);
    e.LoadImageFromScreen = () => {
        const s = new e.Image;
        return h6(s._address), s
    };
    const f6 = a.cwrap("IsImageReady", "boolean", ["pointer"]);
    e.IsImageReady = s => f6(s._address);
    const x6 = a.cwrap("UnloadImage", "pointer", ["pointer"]);
    e.UnloadImage = s => x6(s._address);
    const y6 = a.cwrap("ExportImage", "boolean", ["pointer", "string"]);
    e.ExportImage = (s, o) => y6(s._address, o);
    const P6 = a.cwrap("ExportImageToMemory", "pointer", ["pointer", "string", "pointer"]);
    e.ExportImageToMemory = (s, o, l) => P6(s._address, o, l._address);
    const F6 = a.cwrap("ExportImageAsCode", "boolean", ["pointer", "string"]);
    e.ExportImageAsCode = (s, o) => F6(s._address, o);
    const N6 = a.cwrap("GenImageColor", "void", ["pointer", "number", "number", "pointer"]);
    e.GenImageColor = (s, o, l) => {
        const d = new e.Image;
        return N6(d._address, s, o, l._address), d
    };
    const v6 = a.cwrap("GenImageGradientLinear", "void", ["pointer", "number", "number", "number", "pointer", "pointer"]);
    e.GenImageGradientLinear = (s, o, l, d, E) => {
        const p = new e.Image;
        return v6(p._address, s, o, l, d._address, E._address), p
    };
    const B6 = a.cwrap("GenImageGradientRadial", "void", ["pointer", "number", "number", "number", "pointer", "pointer"]);
    e.GenImageGradientRadial = (s, o, l, d, E) => {
        const p = new e.Image;
        return B6(p._address, s, o, l, d._address, E._address), p
    };
    const V6 = a.cwrap("GenImageGradientSquare", "void", ["pointer", "number", "number", "number", "pointer", "pointer"]);
    e.GenImageGradientSquare = (s, o, l, d, E) => {
        const p = new e.Image;
        return V6(p._address, s, o, l, d._address, E._address), p
    };
    const U6 = a.cwrap("GenImageChecked", "void", ["pointer", "number", "number", "number", "number", "pointer", "pointer"]);
    e.GenImageChecked = (s, o, l, d, E, p) => {
        const b = new e.Image;
        return U6(b._address, s, o, l, d, E._address, p._address), b
    };
    const H6 = a.cwrap("GenImageWhiteNoise", "void", ["pointer", "number", "number", "number"]);
    e.GenImageWhiteNoise = (s, o, l) => {
        const d = new e.Image;
        return H6(d._address, s, o, l), d
    };
    const W6 = a.cwrap("GenImagePerlinNoise", "void", ["pointer", "number", "number", "number", "number", "number"]);
    e.GenImagePerlinNoise = (s, o, l, d, E) => {
        const p = new e.Image;
        return W6(p._address, s, o, l, d, E), p
    };
    const k6 = a.cwrap("GenImageCellular", "void", ["pointer", "number", "number", "number"]);
    e.GenImageCellular = (s, o, l) => {
        const d = new e.Image;
        return k6(d._address, s, o, l), d
    };
    const X6 = a.cwrap("GenImageText", "void", ["pointer", "number", "number", "string"]);
    e.GenImageText = (s, o, l) => {
        const d = new e.Image;
        return X6(d._address, s, o, l), d
    };
    const Y6 = a.cwrap("ImageCopy", "void", ["pointer", "pointer"]);
    e.ImageCopy = s => {
        const o = new e.Image;
        return Y6(o._address, s._address), o
    };
    const K6 = a.cwrap("ImageFromImage", "void", ["pointer", "pointer", "pointer"]);
    e.ImageFromImage = (s, o) => {
        const l = new e.Image;
        return K6(l._address, s._address, o._address), l
    };
    const z6 = a.cwrap("ImageText", "void", ["pointer", "string", "number", "pointer"]);
    e.ImageText = (s, o, l) => {
        const d = new e.Image;
        return z6(d._address, s, o, l._address), d
    };
    const Q6 = a.cwrap("ImageTextEx", "void", ["pointer", "pointer", "string", "number", "number", "pointer"]);
    e.ImageTextEx = (s, o, l, d, E) => {
        const p = new e.Image;
        return Q6(p._address, s._address, o, l, d, E._address), p
    };
    const q6 = a.cwrap("ImageFormat", "pointer", ["pointer", "number"]);
    e.ImageFormat = (s, o) => q6(s._address, o);
    const j6 = a.cwrap("ImageToPOT", "pointer", ["pointer", "pointer"]);
    e.ImageToPOT = (s, o) => j6(s._address, o._address);
    const Z6 = a.cwrap("ImageCrop", "pointer", ["pointer", "pointer"]);
    e.ImageCrop = (s, o) => Z6(s._address, o._address);
    const J6 = a.cwrap("ImageAlphaCrop", "pointer", ["pointer", "number"]);
    e.ImageAlphaCrop = (s, o) => J6(s._address, o);
    const $6 = a.cwrap("ImageAlphaClear", "pointer", ["pointer", "pointer", "number"]);
    e.ImageAlphaClear = (s, o, l) => $6(s._address, o._address, l);
    const e0 = a.cwrap("ImageAlphaMask", "pointer", ["pointer", "pointer"]);
    e.ImageAlphaMask = (s, o) => e0(s._address, o._address);
    const r0 = a.cwrap("ImageAlphaPremultiply", "pointer", ["pointer"]);
    e.ImageAlphaPremultiply = s => r0(s._address);
    const t0 = a.cwrap("ImageBlurGaussian", "pointer", ["pointer", "number"]);
    e.ImageBlurGaussian = (s, o) => t0(s._address, o);
    const a0 = a.cwrap("ImageResize", "pointer", ["pointer", "number", "number"]);
    e.ImageResize = (s, o, l) => a0(s._address, o, l);
    const o0 = a.cwrap("ImageResizeNN", "pointer", ["pointer", "number", "number"]);
    e.ImageResizeNN = (s, o, l) => o0(s._address, o, l);
    const n0 = a.cwrap("ImageResizeCanvas", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.ImageResizeCanvas = (s, o, l, d, E, p) => n0(s._address, o, l, d, E, p._address);
    const s0 = a.cwrap("ImageMipmaps", "pointer", ["pointer"]);
    e.ImageMipmaps = s => s0(s._address);
    const i0 = a.cwrap("ImageDither", "pointer", ["pointer", "number", "number", "number", "number"]);
    e.ImageDither = (s, o, l, d, E) => i0(s._address, o, l, d, E);
    const l0 = a.cwrap("ImageFlipVertical", "pointer", ["pointer"]);
    e.ImageFlipVertical = s => l0(s._address);
    const _0 = a.cwrap("ImageFlipHorizontal", "pointer", ["pointer"]);
    e.ImageFlipHorizontal = s => _0(s._address);
    const d0 = a.cwrap("ImageRotate", "pointer", ["pointer", "number"]);
    e.ImageRotate = (s, o) => d0(s._address, o);
    const u0 = a.cwrap("ImageRotateCW", "pointer", ["pointer"]);
    e.ImageRotateCW = s => u0(s._address);
    const c0 = a.cwrap("ImageRotateCCW", "pointer", ["pointer"]);
    e.ImageRotateCCW = s => c0(s._address);
    const E0 = a.cwrap("ImageColorTint", "pointer", ["pointer", "pointer"]);
    e.ImageColorTint = (s, o) => E0(s._address, o._address);
    const m0 = a.cwrap("ImageColorInvert", "pointer", ["pointer"]);
    e.ImageColorInvert = s => m0(s._address);
    const p0 = a.cwrap("ImageColorGrayscale", "pointer", ["pointer"]);
    e.ImageColorGrayscale = s => p0(s._address);
    const M0 = a.cwrap("ImageColorContrast", "pointer", ["pointer", "number"]);
    e.ImageColorContrast = (s, o) => M0(s._address, o);
    const S0 = a.cwrap("ImageColorBrightness", "pointer", ["pointer", "number"]);
    e.ImageColorBrightness = (s, o) => S0(s._address, o);
    const C0 = a.cwrap("ImageColorReplace", "pointer", ["pointer", "pointer", "pointer"]);
    e.ImageColorReplace = (s, o, l) => C0(s._address, o._address, l._address);
    const R0 = a.cwrap("LoadImageColors", "void", ["pointer", "pointer"]);
    e.LoadImageColors = s => {
        const o = new e.Color;
        return R0(o._address, s._address), o
    };
    const L0 = a.cwrap("LoadImagePalette", "void", ["pointer", "pointer", "number", "pointer"]);
    e.LoadImagePalette = (s, o, l) => {
        const d = new e.Color;
        return L0(d._address, s._address, o, l._address), d
    };
    const I0 = a.cwrap("UnloadImageColors", "pointer", ["pointer"]);
    e.UnloadImageColors = s => I0(s._address);
    const T0 = a.cwrap("UnloadImagePalette", "pointer", ["pointer"]);
    e.UnloadImagePalette = s => T0(s._address);
    const b0 = a.cwrap("GetImageAlphaBorder", "void", ["pointer", "pointer", "number"]);
    e.GetImageAlphaBorder = (s, o) => {
        const l = new e.Rectangle;
        return b0(l._address, s._address, o), l
    };
    const A0 = a.cwrap("GetImageColor", "void", ["pointer", "pointer", "number", "number"]);
    e.GetImageColor = (s, o, l) => {
        const d = new e.Color;
        return A0(d._address, s._address, o, l), d
    };
    const w0 = a.cwrap("ImageClearBackground", "pointer", ["pointer", "pointer"]);
    e.ImageClearBackground = (s, o) => w0(s._address, o._address);
    const O0 = a.cwrap("ImageDrawPixel", "pointer", ["pointer", "number", "number", "pointer"]);
    e.ImageDrawPixel = (s, o, l, d) => O0(s._address, o, l, d._address);
    const g0 = a.cwrap("ImageDrawPixelV", "pointer", ["pointer", "pointer", "pointer"]);
    e.ImageDrawPixelV = (s, o, l) => g0(s._address, o._address, l._address);
    const G0 = a.cwrap("ImageDrawLine", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.ImageDrawLine = (s, o, l, d, E, p) => G0(s._address, o, l, d, E, p._address);
    const D0 = a.cwrap("ImageDrawLineV", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.ImageDrawLineV = (s, o, l, d) => D0(s._address, o._address, l._address, d._address);
    const h0 = a.cwrap("ImageDrawCircle", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.ImageDrawCircle = (s, o, l, d, E) => h0(s._address, o, l, d, E._address);
    const f0 = a.cwrap("ImageDrawCircleV", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.ImageDrawCircleV = (s, o, l, d) => f0(s._address, o._address, l, d._address);
    const x0 = a.cwrap("ImageDrawCircleLines", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.ImageDrawCircleLines = (s, o, l, d, E) => x0(s._address, o, l, d, E._address);
    const y0 = a.cwrap("ImageDrawCircleLinesV", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.ImageDrawCircleLinesV = (s, o, l, d) => y0(s._address, o._address, l, d._address);
    const P0 = a.cwrap("ImageDrawRectangle", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.ImageDrawRectangle = (s, o, l, d, E, p) => P0(s._address, o, l, d, E, p._address);
    const F0 = a.cwrap("ImageDrawRectangleV", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.ImageDrawRectangleV = (s, o, l, d) => F0(s._address, o._address, l._address, d._address);
    const N0 = a.cwrap("ImageDrawRectangleRec", "pointer", ["pointer", "pointer", "pointer"]);
    e.ImageDrawRectangleRec = (s, o, l) => N0(s._address, o._address, l._address);
    const v0 = a.cwrap("ImageDrawRectangleLines", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.ImageDrawRectangleLines = (s, o, l, d) => v0(s._address, o._address, l, d._address);
    const B0 = a.cwrap("ImageDraw", "pointer", ["pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.ImageDraw = (s, o, l, d, E) => B0(s._address, o._address, l._address, d._address, E._address);
    const V0 = a.cwrap("ImageDrawText", "pointer", ["pointer", "string", "number", "number", "number", "pointer"]);
    e.ImageDrawText = (s, o, l, d, E, p) => V0(s._address, o, l, d, E, p._address);
    const U0 = a.cwrap("ImageDrawTextEx", "pointer", ["pointer", "pointer", "string", "pointer", "number", "number", "pointer"]);
    e.ImageDrawTextEx = (s, o, l, d, E, p, b) => U0(s._address, o._address, l, d._address, E, p, b._address);
    const H0 = a.cwrap("LoadTexture", "void", ["pointer", "string"]);
    e.LoadTexture = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Texture2D;
        return H0(l._address, s), l
    };
    const W0 = a.cwrap("LoadTextureFromImage", "void", ["pointer", "pointer"]);
    e.LoadTextureFromImage = s => {
        const o = new e.Texture2D;
        return W0(o._address, s._address), o
    };
    const k0 = a.cwrap("LoadTextureCubemap", "void", ["pointer", "pointer", "number"]);
    e.LoadTextureCubemap = (s, o) => {
        const l = new e.TextureCubemap;
        return k0(l._address, s._address, o), l
    };
    const X0 = a.cwrap("LoadRenderTexture", "void", ["pointer", "number", "number"]);
    e.LoadRenderTexture = (s, o) => {
        const l = new e.RenderTexture2D;
        return X0(l._address, s, o), l
    };
    const Y0 = a.cwrap("IsTextureReady", "boolean", ["pointer"]);
    e.IsTextureReady = s => Y0(s._address);
    const K0 = a.cwrap("UnloadTexture", "pointer", ["pointer"]);
    e.UnloadTexture = s => K0(s._address);
    const z0 = a.cwrap("IsRenderTextureReady", "boolean", ["pointer"]);
    e.IsRenderTextureReady = s => z0(s._address);
    const Q0 = a.cwrap("UnloadRenderTexture", "pointer", ["pointer"]);
    e.UnloadRenderTexture = s => Q0(s._address);
    const q0 = a.cwrap("UpdateTexture", "pointer", ["pointer", "pointer"]);
    e.UpdateTexture = (s, o) => q0(s._address, o._address);
    const j0 = a.cwrap("UpdateTextureRec", "pointer", ["pointer", "pointer", "pointer"]);
    e.UpdateTextureRec = (s, o, l) => j0(s._address, o._address, l._address);
    const Z0 = a.cwrap("GenTextureMipmaps", "pointer", ["pointer"]);
    e.GenTextureMipmaps = s => Z0(s._address);
    const J0 = a.cwrap("SetTextureFilter", "pointer", ["pointer", "number"]);
    e.SetTextureFilter = (s, o) => J0(s._address, o);
    const $0 = a.cwrap("SetTextureWrap", "pointer", ["pointer", "number"]);
    e.SetTextureWrap = (s, o) => $0(s._address, o);
    const e4 = a.cwrap("DrawTexture", "pointer", ["pointer", "number", "number", "pointer"]);
    e.DrawTexture = (s, o, l, d) => e4(s._address, o, l, d._address);
    const r4 = a.cwrap("DrawTextureV", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawTextureV = (s, o, l) => r4(s._address, o._address, l._address);
    const t4 = a.cwrap("DrawTextureEx", "pointer", ["pointer", "pointer", "number", "number", "pointer"]);
    e.DrawTextureEx = (s, o, l, d, E) => t4(s._address, o._address, l, d, E._address);
    const a4 = a.cwrap("DrawTextureRec", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.DrawTextureRec = (s, o, l, d) => a4(s._address, o._address, l._address, d._address);
    const o4 = a.cwrap("DrawTexturePro", "pointer", ["pointer", "pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawTexturePro = (s, o, l, d, E, p) => o4(s._address, o._address, l._address, d._address, E, p._address);
    const n4 = a.cwrap("DrawTextureNPatch", "pointer", ["pointer", "pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawTextureNPatch = (s, o, l, d, E, p) => n4(s._address, o._address, l._address, d._address, E, p._address);
    const s4 = a.cwrap("Fade", "void", ["pointer", "pointer", "number"]);
    e.Fade = (s, o) => {
        const l = new e.Color;
        return s4(l._address, s._address, o), l
    };
    const i4 = a.cwrap("ColorToInt", "number", ["pointer"]);
    e.ColorToInt = s => i4(s._address);
    const l4 = a.cwrap("ColorNormalize", "void", ["pointer", "pointer"]);
    e.ColorNormalize = s => {
        const o = new e.Vector4;
        return l4(o._address, s._address), o
    };
    const _4 = a.cwrap("ColorFromNormalized", "void", ["pointer", "pointer"]);
    e.ColorFromNormalized = s => {
        const o = new e.Color;
        return _4(o._address, s._address), o
    };
    const d4 = a.cwrap("ColorToHSV", "void", ["pointer", "pointer"]);
    e.ColorToHSV = s => {
        const o = new e.Vector3;
        return d4(o._address, s._address), o
    };
    const u4 = a.cwrap("ColorFromHSV", "void", ["pointer", "number", "number", "number"]);
    e.ColorFromHSV = (s, o, l) => {
        const d = new e.Color;
        return u4(d._address, s, o, l), d
    };
    const c4 = a.cwrap("ColorTint", "void", ["pointer", "pointer", "pointer"]);
    e.ColorTint = (s, o) => {
        const l = new e.Color;
        return c4(l._address, s._address, o._address), l
    };
    const E4 = a.cwrap("ColorBrightness", "void", ["pointer", "pointer", "number"]);
    e.ColorBrightness = (s, o) => {
        const l = new e.Color;
        return E4(l._address, s._address, o), l
    };
    const m4 = a.cwrap("ColorContrast", "void", ["pointer", "pointer", "number"]);
    e.ColorContrast = (s, o) => {
        const l = new e.Color;
        return m4(l._address, s._address, o), l
    };
    const p4 = a.cwrap("ColorAlpha", "void", ["pointer", "pointer", "number"]);
    e.ColorAlpha = (s, o) => {
        const l = new e.Color;
        return p4(l._address, s._address, o), l
    };
    const M4 = a.cwrap("ColorAlphaBlend", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.ColorAlphaBlend = (s, o, l) => {
        const d = new e.Color;
        return M4(d._address, s._address, o._address, l._address), d
    };
    const S4 = a.cwrap("GetColor", "void", ["pointer", "number"]);
    e.GetColor = s => {
        const o = new e.Color;
        return S4(o._address, s), o
    };
    const C4 = a.cwrap("GetPixelColor", "void", ["pointer", "pointer", "number"]);
    e.GetPixelColor = (s, o) => {
        const l = new e.Color;
        return C4(l._address, s._address, o), l
    };
    const R4 = a.cwrap("SetPixelColor", "pointer", ["pointer", "pointer", "number"]);
    e.SetPixelColor = (s, o, l) => R4(s._address, o._address, l);
    const L4 = a.cwrap("GetPixelDataSize", "number", ["number", "number", "number"]);
    e.GetPixelDataSize = (s, o, l) => L4(s, o, l);
    const I4 = a.cwrap("GetFontDefault", "void", ["pointer"]);
    e.GetFontDefault = () => {
        const s = new e.Font;
        return I4(s._address), s
    };
    const T4 = a.cwrap("LoadFont", "void", ["pointer", "string"]);
    e.LoadFont = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Font;
        return T4(l._address, s), l
    };
    const b4 = a.cwrap("LoadFontEx", "void", ["pointer", "string", "number", "pointer", "number"]);
    e.LoadFontEx = async (s, o, l, d, E) => {
        !E && await e.addFile(s);
        const p = new e.Font;
        return b4(p._address, s, o, l._address, d), p
    };
    const A4 = a.cwrap("LoadFontFromImage", "void", ["pointer", "pointer", "pointer", "number"]);
    e.LoadFontFromImage = (s, o, l) => {
        const d = new e.Font;
        return A4(d._address, s._address, o._address, l), d
    };
    const w4 = a.cwrap("LoadFontFromMemory", "void", ["pointer", "string", "pointer", "number", "number", "pointer", "number"]);
    e.LoadFontFromMemory = (s, o, l, d, E, p) => {
        const b = new e.Font;
        return w4(b._address, s, o._address, l, d, E._address, p), b
    };
    const O4 = a.cwrap("IsFontReady", "boolean", ["pointer"]);
    e.IsFontReady = s => O4(s._address);
    const g4 = a.cwrap("LoadFontData", "void", ["pointer", "pointer", "number", "number", "pointer", "number", "number"]);
    e.LoadFontData = (s, o, l, d, E, p) => {
        const b = new e.GlyphInfo;
        return g4(b._address, s._address, o, l, d._address, E, p), b
    };
    const G4 = a.cwrap("GenImageFontAtlas", "void", ["pointer", "pointer", "pointer", "number", "number", "number", "number"]);
    e.GenImageFontAtlas = (s, o, l, d, E, p) => {
        const b = new e.Image;
        return G4(b._address, s._address, o._address, l, d, E, p), b
    };
    const D4 = a.cwrap("UnloadFontData", "pointer", ["pointer", "number"]);
    e.UnloadFontData = (s, o) => D4(s._address, o);
    const h4 = a.cwrap("UnloadFont", "pointer", ["pointer"]);
    e.UnloadFont = s => h4(s._address);
    const f4 = a.cwrap("ExportFontAsCode", "boolean", ["pointer", "string"]);
    e.ExportFontAsCode = (s, o) => f4(s._address, o);
    const x4 = a.cwrap("DrawFPS", "pointer", ["number", "number"]);
    e.DrawFPS = (s, o) => x4(s, o);
    const y4 = a.cwrap("DrawText", "pointer", ["string", "number", "number", "number", "pointer"]);
    e.DrawText = (s, o, l, d, E) => y4(s, o, l, d, E._address);
    const P4 = a.cwrap("DrawTextEx", "pointer", ["pointer", "string", "pointer", "number", "number", "pointer"]);
    e.DrawTextEx = (s, o, l, d, E, p) => P4(s._address, o, l._address, d, E, p._address);
    const F4 = a.cwrap("DrawTextPro", "pointer", ["pointer", "string", "pointer", "pointer", "number", "number", "number", "pointer"]);
    e.DrawTextPro = (s, o, l, d, E, p, b, x) => F4(s._address, o, l._address, d._address, E, p, b, x._address);
    const N4 = a.cwrap("DrawTextCodepoint", "pointer", ["pointer", "number", "pointer", "number", "pointer"]);
    e.DrawTextCodepoint = (s, o, l, d, E) => N4(s._address, o, l._address, d, E._address);
    const v4 = a.cwrap("DrawTextCodepoints", "pointer", ["pointer", "pointer", "number", "pointer", "number", "number", "pointer"]);
    e.DrawTextCodepoints = (s, o, l, d, E, p, b) => v4(s._address, o._address, l, d._address, E, p, b._address);
    const B4 = a.cwrap("SetTextLineSpacing", "pointer", ["number"]);
    e.SetTextLineSpacing = s => B4(s);
    const V4 = a.cwrap("MeasureText", "number", ["string", "number"]);
    e.MeasureText = (s, o) => V4(s, o);
    const U4 = a.cwrap("MeasureTextEx", "void", ["pointer", "pointer", "string", "number", "number"]);
    e.MeasureTextEx = (s, o, l, d) => {
        const E = new e.Vector2;
        return U4(E._address, s._address, o, l, d), E
    };
    const H4 = a.cwrap("GetGlyphIndex", "number", ["pointer", "number"]);
    e.GetGlyphIndex = (s, o) => H4(s._address, o);
    const W4 = a.cwrap("GetGlyphInfo", "void", ["pointer", "pointer", "number"]);
    e.GetGlyphInfo = (s, o) => {
        const l = new e.GlyphInfo;
        return W4(l._address, s._address, o), l
    };
    const k4 = a.cwrap("GetGlyphAtlasRec", "void", ["pointer", "pointer", "number"]);
    e.GetGlyphAtlasRec = (s, o) => {
        const l = new e.Rectangle;
        return k4(l._address, s._address, o), l
    };
    const X4 = a.cwrap("LoadUTF8", "string", ["pointer", "number"]);
    e.LoadUTF8 = (s, o) => X4(s._address, o);
    const Y4 = a.cwrap("UnloadUTF8", "pointer", ["string"]);
    e.UnloadUTF8 = s => Y4(s);
    const K4 = a.cwrap("LoadCodepoints", "pointer", ["string", "pointer"]);
    e.LoadCodepoints = (s, o) => K4(s, o._address);
    const z4 = a.cwrap("UnloadCodepoints", "pointer", ["pointer"]);
    e.UnloadCodepoints = s => z4(s._address);
    const Q4 = a.cwrap("GetCodepointCount", "number", ["string"]);
    e.GetCodepointCount = s => Q4(s);
    const q4 = a.cwrap("GetCodepoint", "number", ["string", "pointer"]);
    e.GetCodepoint = (s, o) => q4(s, o._address);
    const j4 = a.cwrap("GetCodepointNext", "number", ["string", "pointer"]);
    e.GetCodepointNext = (s, o) => j4(s, o._address);
    const Z4 = a.cwrap("GetCodepointPrevious", "number", ["string", "pointer"]);
    e.GetCodepointPrevious = (s, o) => Z4(s, o._address);
    const J4 = a.cwrap("CodepointToUTF8", "string", ["number", "pointer"]);
    e.CodepointToUTF8 = (s, o) => J4(s, o._address);
    const $4 = a.cwrap("TextCopy", "number", ["string", "string"]);
    e.TextCopy = (s, o) => $4(s, o);
    const e5 = a.cwrap("TextIsEqual", "boolean", ["string", "string"]);
    e.TextIsEqual = (s, o) => e5(s, o);
    const r5 = a.cwrap("TextLength", "number", ["string"]);
    e.TextLength = s => r5(s);
    const t5 = a.cwrap("TextFormat", "string", ["string", "pointer"]);
    e.TextFormat = (s, o) => t5(s, o._address);
    const a5 = a.cwrap("TextSubtext", "string", ["string", "number", "number"]);
    e.TextSubtext = (s, o, l) => a5(s, o, l);
    const o5 = a.cwrap("TextReplace", "string", ["string", "string", "string"]);
    e.TextReplace = (s, o, l) => o5(s, o, l);
    const n5 = a.cwrap("TextInsert", "string", ["string", "string", "number"]);
    e.TextInsert = (s, o, l) => n5(s, o, l);
    const s5 = a.cwrap("TextJoin", "string", ["pointer", "number", "string"]);
    e.TextJoin = (s, o, l) => s5(s._address, o, l);
    const i5 = a.cwrap("TextSplit", "pointer", ["string", "number", "pointer"]);
    e.TextSplit = (s, o, l) => i5(s, o, l._address);
    const l5 = a.cwrap("TextAppend", "pointer", ["string", "string", "pointer"]);
    e.TextAppend = (s, o, l) => l5(s, o, l._address);
    const _5 = a.cwrap("TextFindIndex", "number", ["string", "string"]);
    e.TextFindIndex = (s, o) => _5(s, o);
    const d5 = a.cwrap("TextToUpper", "string", ["string"]);
    e.TextToUpper = s => d5(s);
    const u5 = a.cwrap("TextToLower", "string", ["string"]);
    e.TextToLower = s => u5(s);
    const c5 = a.cwrap("TextToPascal", "string", ["string"]);
    e.TextToPascal = s => c5(s);
    const E5 = a.cwrap("TextToInteger", "number", ["string"]);
    e.TextToInteger = s => E5(s);
    const m5 = a.cwrap("DrawLine3D", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawLine3D = (s, o, l) => m5(s._address, o._address, l._address);
    const p5 = a.cwrap("DrawPoint3D", "pointer", ["pointer", "pointer"]);
    e.DrawPoint3D = (s, o) => p5(s._address, o._address);
    const M5 = a.cwrap("DrawCircle3D", "pointer", ["pointer", "number", "pointer", "number", "pointer"]);
    e.DrawCircle3D = (s, o, l, d, E) => M5(s._address, o, l._address, d, E._address);
    const S5 = a.cwrap("DrawTriangle3D", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.DrawTriangle3D = (s, o, l, d) => S5(s._address, o._address, l._address, d._address);
    const C5 = a.cwrap("DrawTriangleStrip3D", "pointer", ["pointer", "number", "pointer"]);
    e.DrawTriangleStrip3D = (s, o, l) => C5(s._address, o, l._address);
    const R5 = a.cwrap("DrawCube", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawCube = (s, o, l, d, E) => R5(s._address, o, l, d, E._address);
    const L5 = a.cwrap("DrawCubeV", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawCubeV = (s, o, l) => L5(s._address, o._address, l._address);
    const I5 = a.cwrap("DrawCubeWires", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawCubeWires = (s, o, l, d, E) => I5(s._address, o, l, d, E._address);
    const T5 = a.cwrap("DrawCubeWiresV", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawCubeWiresV = (s, o, l) => T5(s._address, o._address, l._address);
    const b5 = a.cwrap("DrawSphere", "pointer", ["pointer", "number", "pointer"]);
    e.DrawSphere = (s, o, l) => b5(s._address, o, l._address);
    const A5 = a.cwrap("DrawSphereEx", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawSphereEx = (s, o, l, d, E) => A5(s._address, o, l, d, E._address);
    const w5 = a.cwrap("DrawSphereWires", "pointer", ["pointer", "number", "number", "number", "pointer"]);
    e.DrawSphereWires = (s, o, l, d, E) => w5(s._address, o, l, d, E._address);
    const O5 = a.cwrap("DrawCylinder", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.DrawCylinder = (s, o, l, d, E, p) => O5(s._address, o, l, d, E, p._address);
    const g5 = a.cwrap("DrawCylinderEx", "pointer", ["pointer", "pointer", "number", "number", "number", "pointer"]);
    e.DrawCylinderEx = (s, o, l, d, E, p) => g5(s._address, o._address, l, d, E, p._address);
    const G5 = a.cwrap("DrawCylinderWires", "pointer", ["pointer", "number", "number", "number", "number", "pointer"]);
    e.DrawCylinderWires = (s, o, l, d, E, p) => G5(s._address, o, l, d, E, p._address);
    const D5 = a.cwrap("DrawCylinderWiresEx", "pointer", ["pointer", "pointer", "number", "number", "number", "pointer"]);
    e.DrawCylinderWiresEx = (s, o, l, d, E, p) => D5(s._address, o._address, l, d, E, p._address);
    const h5 = a.cwrap("DrawCapsule", "pointer", ["pointer", "pointer", "number", "number", "number", "pointer"]);
    e.DrawCapsule = (s, o, l, d, E, p) => h5(s._address, o._address, l, d, E, p._address);
    const f5 = a.cwrap("DrawCapsuleWires", "pointer", ["pointer", "pointer", "number", "number", "number", "pointer"]);
    e.DrawCapsuleWires = (s, o, l, d, E, p) => f5(s._address, o._address, l, d, E, p._address);
    const x5 = a.cwrap("DrawPlane", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawPlane = (s, o, l) => x5(s._address, o._address, l._address);
    const y5 = a.cwrap("DrawRay", "pointer", ["pointer", "pointer"]);
    e.DrawRay = (s, o) => y5(s._address, o._address);
    const P5 = a.cwrap("DrawGrid", "pointer", ["number", "number"]);
    e.DrawGrid = (s, o) => P5(s, o);
    const F5 = a.cwrap("LoadModel", "void", ["pointer", "string"]);
    e.LoadModel = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Model;
        return F5(l._address, s), l
    };
    const N5 = a.cwrap("LoadModelFromMesh", "void", ["pointer", "pointer"]);
    e.LoadModelFromMesh = s => {
        const o = new e.Model;
        return N5(o._address, s._address), o
    };
    const v5 = a.cwrap("IsModelReady", "boolean", ["pointer"]);
    e.IsModelReady = s => v5(s._address);
    const B5 = a.cwrap("UnloadModel", "pointer", ["pointer"]);
    e.UnloadModel = s => B5(s._address);
    const V5 = a.cwrap("GetModelBoundingBox", "void", ["pointer", "pointer"]);
    e.GetModelBoundingBox = s => {
        const o = new e.BoundingBox;
        return V5(o._address, s._address), o
    };
    const U5 = a.cwrap("DrawModel", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.DrawModel = (s, o, l, d) => U5(s._address, o._address, l, d._address);
    const H5 = a.cwrap("DrawModelEx", "pointer", ["pointer", "pointer", "pointer", "number", "pointer", "pointer"]);
    e.DrawModelEx = (s, o, l, d, E, p) => H5(s._address, o._address, l._address, d, E._address, p._address);
    const W5 = a.cwrap("DrawModelWires", "pointer", ["pointer", "pointer", "number", "pointer"]);
    e.DrawModelWires = (s, o, l, d) => W5(s._address, o._address, l, d._address);
    const k5 = a.cwrap("DrawModelWiresEx", "pointer", ["pointer", "pointer", "pointer", "number", "pointer", "pointer"]);
    e.DrawModelWiresEx = (s, o, l, d, E, p) => k5(s._address, o._address, l._address, d, E._address, p._address);
    const X5 = a.cwrap("DrawBoundingBox", "pointer", ["pointer", "pointer"]);
    e.DrawBoundingBox = (s, o) => X5(s._address, o._address);
    const Y5 = a.cwrap("DrawBillboard", "pointer", ["pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawBillboard = (s, o, l, d, E) => Y5(s._address, o._address, l._address, d, E._address);
    const K5 = a.cwrap("DrawBillboardRec", "pointer", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.DrawBillboardRec = (s, o, l, d, E, p) => K5(s._address, o._address, l._address, d._address, E._address, p._address);
    const z5 = a.cwrap("DrawBillboardPro", "pointer", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "number", "pointer"]);
    e.DrawBillboardPro = (s, o, l, d, E, p, b, x, P) => z5(s._address, o._address, l._address, d._address, E._address, p._address, b._address, x, P._address);
    const Q5 = a.cwrap("UploadMesh", "pointer", ["pointer", "boolean"]);
    e.UploadMesh = (s, o) => Q5(s._address, o);
    const q5 = a.cwrap("UpdateMeshBuffer", "pointer", ["pointer", "number", "pointer", "number", "number"]);
    e.UpdateMeshBuffer = (s, o, l, d, E) => q5(s._address, o, l._address, d, E);
    const j5 = a.cwrap("UnloadMesh", "pointer", ["pointer"]);
    e.UnloadMesh = s => j5(s._address);
    const Z5 = a.cwrap("DrawMesh", "pointer", ["pointer", "pointer", "pointer"]);
    e.DrawMesh = (s, o, l) => Z5(s._address, o._address, l._address);
    const J5 = a.cwrap("DrawMeshInstanced", "pointer", ["pointer", "pointer", "pointer", "number"]);
    e.DrawMeshInstanced = (s, o, l, d) => J5(s._address, o._address, l._address, d);
    const $5 = a.cwrap("ExportMesh", "boolean", ["pointer", "string"]);
    e.ExportMesh = (s, o) => $5(s._address, o);
    const e8 = a.cwrap("GetMeshBoundingBox", "void", ["pointer", "pointer"]);
    e.GetMeshBoundingBox = s => {
        const o = new e.BoundingBox;
        return e8(o._address, s._address), o
    };
    const r8 = a.cwrap("GenMeshTangents", "pointer", ["pointer"]);
    e.GenMeshTangents = s => r8(s._address);
    const t8 = a.cwrap("GenMeshPoly", "void", ["pointer", "number", "number"]);
    e.GenMeshPoly = (s, o) => {
        const l = new e.Mesh;
        return t8(l._address, s, o), l
    };
    const a8 = a.cwrap("GenMeshPlane", "void", ["pointer", "number", "number", "number", "number"]);
    e.GenMeshPlane = (s, o, l, d) => {
        const E = new e.Mesh;
        return a8(E._address, s, o, l, d), E
    };
    const o8 = a.cwrap("GenMeshCube", "void", ["pointer", "number", "number", "number"]);
    e.GenMeshCube = (s, o, l) => {
        const d = new e.Mesh;
        return o8(d._address, s, o, l), d
    };
    const n8 = a.cwrap("GenMeshSphere", "void", ["pointer", "number", "number", "number"]);
    e.GenMeshSphere = (s, o, l) => {
        const d = new e.Mesh;
        return n8(d._address, s, o, l), d
    };
    const s8 = a.cwrap("GenMeshHemiSphere", "void", ["pointer", "number", "number", "number"]);
    e.GenMeshHemiSphere = (s, o, l) => {
        const d = new e.Mesh;
        return s8(d._address, s, o, l), d
    };
    const i8 = a.cwrap("GenMeshCylinder", "void", ["pointer", "number", "number", "number"]);
    e.GenMeshCylinder = (s, o, l) => {
        const d = new e.Mesh;
        return i8(d._address, s, o, l), d
    };
    const l8 = a.cwrap("GenMeshCone", "void", ["pointer", "number", "number", "number"]);
    e.GenMeshCone = (s, o, l) => {
        const d = new e.Mesh;
        return l8(d._address, s, o, l), d
    };
    const _8 = a.cwrap("GenMeshTorus", "void", ["pointer", "number", "number", "number", "number"]);
    e.GenMeshTorus = (s, o, l, d) => {
        const E = new e.Mesh;
        return _8(E._address, s, o, l, d), E
    };
    const d8 = a.cwrap("GenMeshKnot", "void", ["pointer", "number", "number", "number", "number"]);
    e.GenMeshKnot = (s, o, l, d) => {
        const E = new e.Mesh;
        return d8(E._address, s, o, l, d), E
    };
    const u8 = a.cwrap("GenMeshHeightmap", "void", ["pointer", "pointer", "pointer"]);
    e.GenMeshHeightmap = (s, o) => {
        const l = new e.Mesh;
        return u8(l._address, s._address, o._address), l
    };
    const c8 = a.cwrap("GenMeshCubicmap", "void", ["pointer", "pointer", "pointer"]);
    e.GenMeshCubicmap = (s, o) => {
        const l = new e.Mesh;
        return c8(l._address, s._address, o._address), l
    };
    const E8 = a.cwrap("LoadMaterials", "void", ["pointer", "string", "pointer"]);
    e.LoadMaterials = async (s, o, l) => {
        !l && await e.addFile(s);
        const d = new e.Material;
        return E8(d._address, s, o._address), d
    };
    const m8 = a.cwrap("LoadMaterialDefault", "void", ["pointer"]);
    e.LoadMaterialDefault = () => {
        const s = new e.Material;
        return m8(s._address), s
    };
    const p8 = a.cwrap("IsMaterialReady", "boolean", ["pointer"]);
    e.IsMaterialReady = s => p8(s._address);
    const M8 = a.cwrap("UnloadMaterial", "pointer", ["pointer"]);
    e.UnloadMaterial = s => M8(s._address);
    const S8 = a.cwrap("SetMaterialTexture", "pointer", ["pointer", "number", "pointer"]);
    e.SetMaterialTexture = (s, o, l) => S8(s._address, o, l._address);
    const C8 = a.cwrap("SetModelMeshMaterial", "pointer", ["pointer", "number", "number"]);
    e.SetModelMeshMaterial = (s, o, l) => C8(s._address, o, l);
    const R8 = a.cwrap("LoadModelAnimations", "void", ["pointer", "string", "pointer"]);
    e.LoadModelAnimations = async (s, o, l) => {
        !l && await e.addFile(s);
        const d = new e.ModelAnimation;
        return R8(d._address, s, o._address), d
    };
    const L8 = a.cwrap("UpdateModelAnimation", "pointer", ["pointer", "pointer", "number"]);
    e.UpdateModelAnimation = (s, o, l) => L8(s._address, o._address, l);
    const I8 = a.cwrap("UnloadModelAnimation", "pointer", ["pointer"]);
    e.UnloadModelAnimation = s => I8(s._address);
    const T8 = a.cwrap("UnloadModelAnimations", "pointer", ["pointer", "number"]);
    e.UnloadModelAnimations = (s, o) => T8(s._address, o);
    const b8 = a.cwrap("IsModelAnimationValid", "boolean", ["pointer", "pointer"]);
    e.IsModelAnimationValid = (s, o) => b8(s._address, o._address);
    const A8 = a.cwrap("CheckCollisionSpheres", "boolean", ["pointer", "number", "pointer", "number"]);
    e.CheckCollisionSpheres = (s, o, l, d) => A8(s._address, o, l._address, d);
    const w8 = a.cwrap("CheckCollisionBoxes", "boolean", ["pointer", "pointer"]);
    e.CheckCollisionBoxes = (s, o) => w8(s._address, o._address);
    const O8 = a.cwrap("CheckCollisionBoxSphere", "boolean", ["pointer", "pointer", "number"]);
    e.CheckCollisionBoxSphere = (s, o, l) => O8(s._address, o._address, l);
    const g8 = a.cwrap("GetRayCollisionSphere", "void", ["pointer", "pointer", "pointer", "number"]);
    e.GetRayCollisionSphere = (s, o, l) => {
        const d = new e.RayCollision;
        return g8(d._address, s._address, o._address, l), d
    };
    const G8 = a.cwrap("GetRayCollisionBox", "void", ["pointer", "pointer", "pointer"]);
    e.GetRayCollisionBox = (s, o) => {
        const l = new e.RayCollision;
        return G8(l._address, s._address, o._address), l
    };
    const D8 = a.cwrap("GetRayCollisionMesh", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.GetRayCollisionMesh = (s, o, l) => {
        const d = new e.RayCollision;
        return D8(d._address, s._address, o._address, l._address), d
    };
    const h8 = a.cwrap("GetRayCollisionTriangle", "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.GetRayCollisionTriangle = (s, o, l, d) => {
        const E = new e.RayCollision;
        return h8(E._address, s._address, o._address, l._address, d._address), E
    };
    const f8 = a.cwrap("GetRayCollisionQuad", "void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.GetRayCollisionQuad = (s, o, l, d, E) => {
        const p = new e.RayCollision;
        return f8(p._address, s._address, o._address, l._address, d._address, E._address), p
    };
    const x8 = a.cwrap("InitAudioDevice", "pointer", []);
    e.InitAudioDevice = () => x8();
    const y8 = a.cwrap("CloseAudioDevice", "pointer", []);
    e.CloseAudioDevice = () => y8();
    const P8 = a.cwrap("IsAudioDeviceReady", "boolean", []);
    e.IsAudioDeviceReady = () => P8();
    const F8 = a.cwrap("SetMasterVolume", "pointer", ["number"]);
    e.SetMasterVolume = s => F8(s);
    const N8 = a.cwrap("LoadWave", "void", ["pointer", "string"]);
    e.LoadWave = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Wave;
        return N8(l._address, s), l
    };
    const v8 = a.cwrap("LoadWaveFromMemory", "void", ["pointer", "string", "pointer", "number"]);
    e.LoadWaveFromMemory = (s, o, l) => {
        const d = new e.Wave;
        return v8(d._address, s, o._address, l), d
    };
    const B8 = a.cwrap("IsWaveReady", "boolean", ["pointer"]);
    e.IsWaveReady = s => B8(s._address);
    const V8 = a.cwrap("LoadSound", "void", ["pointer", "string"]);
    e.LoadSound = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Sound;
        return V8(l._address, s), l
    };
    const U8 = a.cwrap("LoadSoundFromWave", "void", ["pointer", "pointer"]);
    e.LoadSoundFromWave = s => {
        const o = new e.Sound;
        return U8(o._address, s._address), o
    };
    const H8 = a.cwrap("LoadSoundAlias", "void", ["pointer", "pointer"]);
    e.LoadSoundAlias = s => {
        const o = new e.Sound;
        return H8(o._address, s._address), o
    };
    const W8 = a.cwrap("IsSoundReady", "boolean", ["pointer"]);
    e.IsSoundReady = s => W8(s._address);
    const k8 = a.cwrap("UpdateSound", "pointer", ["pointer", "pointer", "number"]);
    e.UpdateSound = (s, o, l) => k8(s._address, o._address, l);
    const X8 = a.cwrap("UnloadWave", "pointer", ["pointer"]);
    e.UnloadWave = s => X8(s._address);
    const Y8 = a.cwrap("UnloadSound", "pointer", ["pointer"]);
    e.UnloadSound = s => Y8(s._address);
    const K8 = a.cwrap("UnloadSoundAlias", "pointer", ["pointer"]);
    e.UnloadSoundAlias = s => K8(s._address);
    const z8 = a.cwrap("ExportWave", "boolean", ["pointer", "string"]);
    e.ExportWave = (s, o) => z8(s._address, o);
    const Q8 = a.cwrap("ExportWaveAsCode", "boolean", ["pointer", "string"]);
    e.ExportWaveAsCode = (s, o) => Q8(s._address, o);
    const q8 = a.cwrap("PlaySound", "pointer", ["pointer"]);
    e.PlaySound = s => q8(s._address);
    const j8 = a.cwrap("StopSound", "pointer", ["pointer"]);
    e.StopSound = s => j8(s._address);
    const Z8 = a.cwrap("PauseSound", "pointer", ["pointer"]);
    e.PauseSound = s => Z8(s._address);
    const J8 = a.cwrap("ResumeSound", "pointer", ["pointer"]);
    e.ResumeSound = s => J8(s._address);
    const $8 = a.cwrap("IsSoundPlaying", "boolean", ["pointer"]);
    e.IsSoundPlaying = s => $8(s._address);
    const e7 = a.cwrap("SetSoundVolume", "pointer", ["pointer", "number"]);
    e.SetSoundVolume = (s, o) => e7(s._address, o);
    const r7 = a.cwrap("SetSoundPitch", "pointer", ["pointer", "number"]);
    e.SetSoundPitch = (s, o) => r7(s._address, o);
    const t7 = a.cwrap("SetSoundPan", "pointer", ["pointer", "number"]);
    e.SetSoundPan = (s, o) => t7(s._address, o);
    const a7 = a.cwrap("WaveCopy", "void", ["pointer", "pointer"]);
    e.WaveCopy = s => {
        const o = new e.Wave;
        return a7(o._address, s._address), o
    };
    const o7 = a.cwrap("WaveCrop", "pointer", ["pointer", "number", "number"]);
    e.WaveCrop = (s, o, l) => o7(s._address, o, l);
    const n7 = a.cwrap("WaveFormat", "pointer", ["pointer", "number", "number", "number"]);
    e.WaveFormat = (s, o, l, d) => n7(s._address, o, l, d);
    const s7 = a.cwrap("LoadWaveSamples", "pointer", ["pointer"]);
    e.LoadWaveSamples = s => s7(s._address);
    const i7 = a.cwrap("UnloadWaveSamples", "pointer", ["pointer"]);
    e.UnloadWaveSamples = s => i7(s._address);
    const l7 = a.cwrap("LoadMusicStream", "void", ["pointer", "string"]);
    e.LoadMusicStream = async (s, o) => {
        !o && await e.addFile(s);
        const l = new e.Music;
        return l7(l._address, s), l
    };
    const _7 = a.cwrap("LoadMusicStreamFromMemory", "void", ["pointer", "string", "pointer", "number"]);
    e.LoadMusicStreamFromMemory = (s, o, l) => {
        const d = new e.Music;
        return _7(d._address, s, o._address, l), d
    };
    const d7 = a.cwrap("IsMusicReady", "boolean", ["pointer"]);
    e.IsMusicReady = s => d7(s._address);
    const u7 = a.cwrap("UnloadMusicStream", "pointer", ["pointer"]);
    e.UnloadMusicStream = s => u7(s._address);
    const c7 = a.cwrap("PlayMusicStream", "pointer", ["pointer"]);
    e.PlayMusicStream = s => c7(s._address);
    const E7 = a.cwrap("IsMusicStreamPlaying", "boolean", ["pointer"]);
    e.IsMusicStreamPlaying = s => E7(s._address);
    const m7 = a.cwrap("UpdateMusicStream", "pointer", ["pointer"]);
    e.UpdateMusicStream = s => m7(s._address);
    const p7 = a.cwrap("StopMusicStream", "pointer", ["pointer"]);
    e.StopMusicStream = s => p7(s._address);
    const M7 = a.cwrap("PauseMusicStream", "pointer", ["pointer"]);
    e.PauseMusicStream = s => M7(s._address);
    const S7 = a.cwrap("ResumeMusicStream", "pointer", ["pointer"]);
    e.ResumeMusicStream = s => S7(s._address);
    const C7 = a.cwrap("SeekMusicStream", "pointer", ["pointer", "number"]);
    e.SeekMusicStream = (s, o) => C7(s._address, o);
    const R7 = a.cwrap("SetMusicVolume", "pointer", ["pointer", "number"]);
    e.SetMusicVolume = (s, o) => R7(s._address, o);
    const L7 = a.cwrap("SetMusicPitch", "pointer", ["pointer", "number"]);
    e.SetMusicPitch = (s, o) => L7(s._address, o);
    const I7 = a.cwrap("SetMusicPan", "pointer", ["pointer", "number"]);
    e.SetMusicPan = (s, o) => I7(s._address, o);
    const T7 = a.cwrap("GetMusicTimeLength", "number", ["pointer"]);
    e.GetMusicTimeLength = s => T7(s._address);
    const b7 = a.cwrap("GetMusicTimePlayed", "number", ["pointer"]);
    e.GetMusicTimePlayed = s => b7(s._address);
    const A7 = a.cwrap("LoadAudioStream", "void", ["pointer", "number", "number", "number"]);
    e.LoadAudioStream = (s, o, l) => {
        const d = new e.AudioStream;
        return A7(d._address, s, o, l), d
    };
    const w7 = a.cwrap("IsAudioStreamReady", "boolean", ["pointer"]);
    e.IsAudioStreamReady = s => w7(s._address);
    const O7 = a.cwrap("UnloadAudioStream", "pointer", ["pointer"]);
    e.UnloadAudioStream = s => O7(s._address);
    const g7 = a.cwrap("UpdateAudioStream", "pointer", ["pointer", "pointer", "number"]);
    e.UpdateAudioStream = (s, o, l) => g7(s._address, o._address, l);
    const G7 = a.cwrap("IsAudioStreamProcessed", "boolean", ["pointer"]);
    e.IsAudioStreamProcessed = s => G7(s._address);
    const D7 = a.cwrap("PlayAudioStream", "pointer", ["pointer"]);
    e.PlayAudioStream = s => D7(s._address);
    const h7 = a.cwrap("PauseAudioStream", "pointer", ["pointer"]);
    e.PauseAudioStream = s => h7(s._address);
    const f7 = a.cwrap("ResumeAudioStream", "pointer", ["pointer"]);
    e.ResumeAudioStream = s => f7(s._address);
    const x7 = a.cwrap("IsAudioStreamPlaying", "boolean", ["pointer"]);
    e.IsAudioStreamPlaying = s => x7(s._address);
    const y7 = a.cwrap("StopAudioStream", "pointer", ["pointer"]);
    e.StopAudioStream = s => y7(s._address);
    const P7 = a.cwrap("SetAudioStreamVolume", "pointer", ["pointer", "number"]);
    e.SetAudioStreamVolume = (s, o) => P7(s._address, o);
    const F7 = a.cwrap("SetAudioStreamPitch", "pointer", ["pointer", "number"]);
    e.SetAudioStreamPitch = (s, o) => F7(s._address, o);
    const N7 = a.cwrap("SetAudioStreamPan", "pointer", ["pointer", "number"]);
    e.SetAudioStreamPan = (s, o) => N7(s._address, o);
    const v7 = a.cwrap("SetAudioStreamBufferSizeDefault", "pointer", ["number"]);
    e.SetAudioStreamBufferSizeDefault = s => v7(s);
    const B7 = a.cwrap("SetAudioStreamCallback", "pointer", ["pointer", "pointer"]);
    e.SetAudioStreamCallback = (s, o) => B7(s._address, o._address);
    const V7 = a.cwrap("AttachAudioStreamProcessor", "pointer", ["pointer", "pointer"]);
    e.AttachAudioStreamProcessor = (s, o) => V7(s._address, o._address);
    const U7 = a.cwrap("DetachAudioStreamProcessor", "pointer", ["pointer", "pointer"]);
    e.DetachAudioStreamProcessor = (s, o) => U7(s._address, o._address);
    const H7 = a.cwrap("AttachAudioMixedProcessor", "pointer", ["pointer"]);
    e.AttachAudioMixedProcessor = s => H7(s._address);
    const W7 = a.cwrap("DetachAudioMixedProcessor", "pointer", ["pointer"]);
    e.DetachAudioMixedProcessor = s => W7(s._address);
    const k7 = a.cwrap("GuiEnable", "pointer", []);
    e.GuiEnable = () => k7();
    const X7 = a.cwrap("GuiDisable", "pointer", []);
    e.GuiDisable = () => X7();
    const Y7 = a.cwrap("GuiLock", "pointer", []);
    e.GuiLock = () => Y7();
    const K7 = a.cwrap("GuiUnlock", "pointer", []);
    e.GuiUnlock = () => K7();
    const z7 = a.cwrap("GuiIsLocked", "boolean", []);
    e.GuiIsLocked = () => z7();
    const Q7 = a.cwrap("GuiSetAlpha", "pointer", ["number"]);
    e.GuiSetAlpha = s => Q7(s);
    const q7 = a.cwrap("GuiSetState", "pointer", ["number"]);
    e.GuiSetState = s => q7(s);
    const j7 = a.cwrap("GuiGetState", "number", []);
    e.GuiGetState = () => j7();
    const Z7 = a.cwrap("GuiSetFont", "pointer", ["pointer"]);
    e.GuiSetFont = s => Z7(s._address);
    const J7 = a.cwrap("GuiGetFont", "void", ["pointer"]);
    e.GuiGetFont = () => {
        const s = new e.Font;
        return J7(s._address), s
    };
    const $7 = a.cwrap("GuiSetStyle", "pointer", ["number", "number", "number"]);
    e.GuiSetStyle = (s, o, l) => $7(s, o, l);
    const e9 = a.cwrap("GuiGetStyle", "number", ["number", "number"]);
    e.GuiGetStyle = (s, o) => e9(s, o);
    const r9 = a.cwrap("GuiLoadStyle", "pointer", ["string"]);
    e.GuiLoadStyle = s => r9(s);
    const t9 = a.cwrap("GuiLoadStyleDefault", "pointer", []);
    e.GuiLoadStyleDefault = () => t9();
    const a9 = a.cwrap("GuiEnableTooltip", "pointer", []);
    e.GuiEnableTooltip = () => a9();
    const o9 = a.cwrap("GuiDisableTooltip", "pointer", []);
    e.GuiDisableTooltip = () => o9();
    const n9 = a.cwrap("GuiSetTooltip", "pointer", ["string"]);
    e.GuiSetTooltip = s => n9(s);
    const s9 = a.cwrap("GuiIconText", "string", ["number", "string"]);
    e.GuiIconText = (s, o) => s9(s, o);
    const i9 = a.cwrap("GuiSetIconScale", "pointer", ["number"]);
    e.GuiSetIconScale = s => i9(s);
    const l9 = a.cwrap("GuiGetIcons", "pointer", []);
    e.GuiGetIcons = () => l9();
    const _9 = a.cwrap("GuiLoadIcons", "pointer", ["string", "boolean"]);
    e.GuiLoadIcons = (s, o) => _9(s, o);
    const d9 = a.cwrap("GuiDrawIcon", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.GuiDrawIcon = (s, o, l, d, E) => d9(s, o, l, d, E._address);
    const u9 = a.cwrap("GuiWindowBox", "number", ["pointer", "string"]);
    e.GuiWindowBox = (s, o) => u9(s._address, o);
    const c9 = a.cwrap("GuiGroupBox", "number", ["pointer", "string"]);
    e.GuiGroupBox = (s, o) => c9(s._address, o);
    const E9 = a.cwrap("GuiLine", "number", ["pointer", "string"]);
    e.GuiLine = (s, o) => E9(s._address, o);
    const m9 = a.cwrap("GuiPanel", "number", ["pointer", "string"]);
    e.GuiPanel = (s, o) => m9(s._address, o);
    const p9 = a.cwrap("GuiTabBar", "number", ["pointer", "pointer", "number", "pointer"]);
    e.GuiTabBar = (s, o, l, d) => p9(s._address, o._address, l, d._address);
    const M9 = a.cwrap("GuiScrollPanel", "number", ["pointer", "string", "pointer", "pointer", "pointer"]);
    e.GuiScrollPanel = (s, o, l, d, E) => M9(s._address, o, l._address, d._address, E._address);
    const S9 = a.cwrap("GuiLabel", "number", ["pointer", "string"]);
    e.GuiLabel = (s, o) => S9(s._address, o);
    const C9 = a.cwrap("GuiButton", "number", ["pointer", "string"]);
    e.GuiButton = (s, o) => C9(s._address, o);
    const R9 = a.cwrap("GuiLabelButton", "number", ["pointer", "string"]);
    e.GuiLabelButton = (s, o) => R9(s._address, o);
    const L9 = a.cwrap("GuiToggle", "number", ["pointer", "string", "pointer"]);
    e.GuiToggle = (s, o, l) => L9(s._address, o, l._address);
    const I9 = a.cwrap("GuiToggleGroup", "number", ["pointer", "string", "pointer"]);
    e.GuiToggleGroup = (s, o, l) => I9(s._address, o, l._address);
    const T9 = a.cwrap("GuiToggleSlider", "number", ["pointer", "string", "pointer"]);
    e.GuiToggleSlider = (s, o, l) => T9(s._address, o, l._address);
    const b9 = a.cwrap("GuiCheckBox", "number", ["pointer", "string", "pointer"]);
    e.GuiCheckBox = (s, o, l) => b9(s._address, o, l._address);
    const A9 = a.cwrap("GuiComboBox", "number", ["pointer", "string", "pointer"]);
    e.GuiComboBox = (s, o, l) => A9(s._address, o, l._address);
    const w9 = a.cwrap("GuiDropdownBox", "number", ["pointer", "string", "pointer", "boolean"]);
    e.GuiDropdownBox = (s, o, l, d) => w9(s._address, o, l._address, d);
    const O9 = a.cwrap("GuiSpinner", "number", ["pointer", "string", "pointer", "number", "number", "boolean"]);
    e.GuiSpinner = (s, o, l, d, E, p) => O9(s._address, o, l._address, d, E, p);
    const g9 = a.cwrap("GuiValueBox", "number", ["pointer", "string", "pointer", "number", "number", "boolean"]);
    e.GuiValueBox = (s, o, l, d, E, p) => g9(s._address, o, l._address, d, E, p);
    const G9 = a.cwrap("GuiTextBox", "number", ["pointer", "string", "number", "boolean"]);
    e.GuiTextBox = (s, o, l, d) => G9(s._address, o, l, d);
    const D9 = a.cwrap("GuiSlider", "number", ["pointer", "string", "string", "pointer", "number", "number"]);
    e.GuiSlider = (s, o, l, d, E, p) => D9(s._address, o, l, d._address, E, p);
    const h9 = a.cwrap("GuiSliderBar", "number", ["pointer", "string", "string", "pointer", "number", "number"]);
    e.GuiSliderBar = (s, o, l, d, E, p) => h9(s._address, o, l, d._address, E, p);
    const f9 = a.cwrap("GuiProgressBar", "number", ["pointer", "string", "string", "pointer", "number", "number"]);
    e.GuiProgressBar = (s, o, l, d, E, p) => f9(s._address, o, l, d._address, E, p);
    const x9 = a.cwrap("GuiStatusBar", "number", ["pointer", "string"]);
    e.GuiStatusBar = (s, o) => x9(s._address, o);
    const y9 = a.cwrap("GuiDummyRec", "number", ["pointer", "string"]);
    e.GuiDummyRec = (s, o) => y9(s._address, o);
    const P9 = a.cwrap("GuiGrid", "number", ["pointer", "string", "number", "number", "pointer"]);
    e.GuiGrid = (s, o, l, d, E) => P9(s._address, o, l, d, E._address);
    const F9 = a.cwrap("GuiListView", "number", ["pointer", "string", "pointer", "pointer"]);
    e.GuiListView = (s, o, l, d) => F9(s._address, o, l._address, d._address);
    const N9 = a.cwrap("GuiListViewEx", "number", ["pointer", "pointer", "number", "pointer", "pointer", "pointer"]);
    e.GuiListViewEx = (s, o, l, d, E, p) => N9(s._address, o._address, l, d._address, E._address, p._address);
    const v9 = a.cwrap("GuiMessageBox", "number", ["pointer", "string", "string", "string"]);
    e.GuiMessageBox = (s, o, l, d) => v9(s._address, o, l, d);
    const B9 = a.cwrap("GuiTextInputBox", "number", ["pointer", "string", "string", "string", "string", "number", "pointer"]);
    e.GuiTextInputBox = (s, o, l, d, E, p, b) => B9(s._address, o, l, d, E, p, b._address);
    const V9 = a.cwrap("GuiColorPicker", "number", ["pointer", "string", "pointer"]);
    e.GuiColorPicker = (s, o, l) => V9(s._address, o, l._address);
    const U9 = a.cwrap("GuiColorPanel", "number", ["pointer", "string", "pointer"]);
    e.GuiColorPanel = (s, o, l) => U9(s._address, o, l._address);
    const H9 = a.cwrap("GuiColorBarAlpha", "number", ["pointer", "string", "pointer"]);
    e.GuiColorBarAlpha = (s, o, l) => H9(s._address, o, l._address);
    const W9 = a.cwrap("GuiColorBarHue", "number", ["pointer", "string", "pointer"]);
    e.GuiColorBarHue = (s, o, l) => W9(s._address, o, l._address);
    const k9 = a.cwrap("GuiColorPickerHSV", "number", ["pointer", "string", "pointer"]);
    e.GuiColorPickerHSV = (s, o, l) => k9(s._address, o, l._address);
    const X9 = a.cwrap("GuiColorPanelHSV", "number", ["pointer", "string", "pointer"]);
    e.GuiColorPanelHSV = (s, o, l) => X9(s._address, o, l._address);
    const Y9 = a.cwrap("Clamp", "number", ["number", "number", "number"]);
    e.Clamp = (s, o, l) => Y9(s, o, l);
    const K9 = a.cwrap("Lerp", "number", ["number", "number", "number"]);
    e.Lerp = (s, o, l) => K9(s, o, l);
    const z9 = a.cwrap("Normalize", "number", ["number", "number", "number"]);
    e.Normalize = (s, o, l) => z9(s, o, l);
    const Q9 = a.cwrap("Remap", "number", ["number", "number", "number", "number", "number"]);
    e.Remap = (s, o, l, d, E) => Q9(s, o, l, d, E);
    const q9 = a.cwrap("Wrap", "number", ["number", "number", "number"]);
    e.Wrap = (s, o, l) => q9(s, o, l);
    const j9 = a.cwrap("FloatEquals", "number", ["number", "number"]);
    e.FloatEquals = (s, o) => j9(s, o);
    const Z9 = a.cwrap("Vector2Zero", "void", ["pointer"]);
    e.Vector2Zero = () => {
        const s = new e.Vector2;
        return Z9(s._address), s
    };
    const J9 = a.cwrap("Vector2One", "void", ["pointer"]);
    e.Vector2One = () => {
        const s = new e.Vector2;
        return J9(s._address), s
    };
    const $9 = a.cwrap("Vector2Add", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Add = (s, o) => {
        const l = new e.Vector2;
        return $9(l._address, s._address, o._address), l
    };
    const ee = a.cwrap("Vector2AddValue", "void", ["pointer", "pointer", "number"]);
    e.Vector2AddValue = (s, o) => {
        const l = new e.Vector2;
        return ee(l._address, s._address, o), l
    };
    const re = a.cwrap("Vector2Subtract", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Subtract = (s, o) => {
        const l = new e.Vector2;
        return re(l._address, s._address, o._address), l
    };
    const te = a.cwrap("Vector2SubtractValue", "void", ["pointer", "pointer", "number"]);
    e.Vector2SubtractValue = (s, o) => {
        const l = new e.Vector2;
        return te(l._address, s._address, o), l
    };
    const ae = a.cwrap("Vector2Length", "number", ["pointer"]);
    e.Vector2Length = s => ae(s._address);
    const oe = a.cwrap("Vector2LengthSqr", "number", ["pointer"]);
    e.Vector2LengthSqr = s => oe(s._address);
    const ne = a.cwrap("Vector2DotProduct", "number", ["pointer", "pointer"]);
    e.Vector2DotProduct = (s, o) => ne(s._address, o._address);
    const se = a.cwrap("Vector2Distance", "number", ["pointer", "pointer"]);
    e.Vector2Distance = (s, o) => se(s._address, o._address);
    const ie = a.cwrap("Vector2DistanceSqr", "number", ["pointer", "pointer"]);
    e.Vector2DistanceSqr = (s, o) => ie(s._address, o._address);
    const le = a.cwrap("Vector2Angle", "number", ["pointer", "pointer"]);
    e.Vector2Angle = (s, o) => le(s._address, o._address);
    const _e = a.cwrap("Vector2LineAngle", "number", ["pointer", "pointer"]);
    e.Vector2LineAngle = (s, o) => _e(s._address, o._address);
    const de = a.cwrap("Vector2Scale", "void", ["pointer", "pointer", "number"]);
    e.Vector2Scale = (s, o) => {
        const l = new e.Vector2;
        return de(l._address, s._address, o), l
    };
    const ue = a.cwrap("Vector2Multiply", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Multiply = (s, o) => {
        const l = new e.Vector2;
        return ue(l._address, s._address, o._address), l
    };
    const ce = a.cwrap("Vector2Negate", "void", ["pointer", "pointer"]);
    e.Vector2Negate = s => {
        const o = new e.Vector2;
        return ce(o._address, s._address), o
    };
    const Ee = a.cwrap("Vector2Divide", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Divide = (s, o) => {
        const l = new e.Vector2;
        return Ee(l._address, s._address, o._address), l
    };
    const me = a.cwrap("Vector2Normalize", "void", ["pointer", "pointer"]);
    e.Vector2Normalize = s => {
        const o = new e.Vector2;
        return me(o._address, s._address), o
    };
    const pe = a.cwrap("Vector2Transform", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Transform = (s, o) => {
        const l = new e.Vector2;
        return pe(l._address, s._address, o._address), l
    };
    const Me = a.cwrap("Vector2Lerp", "void", ["pointer", "pointer", "pointer", "number"]);
    e.Vector2Lerp = (s, o, l) => {
        const d = new e.Vector2;
        return Me(d._address, s._address, o._address, l), d
    };
    const Se = a.cwrap("Vector2Reflect", "void", ["pointer", "pointer", "pointer"]);
    e.Vector2Reflect = (s, o) => {
        const l = new e.Vector2;
        return Se(l._address, s._address, o._address), l
    };
    const Ce = a.cwrap("Vector2Rotate", "void", ["pointer", "pointer", "number"]);
    e.Vector2Rotate = (s, o) => {
        const l = new e.Vector2;
        return Ce(l._address, s._address, o), l
    };
    const Re = a.cwrap("Vector2MoveTowards", "void", ["pointer", "pointer", "pointer", "number"]);
    e.Vector2MoveTowards = (s, o, l) => {
        const d = new e.Vector2;
        return Re(d._address, s._address, o._address, l), d
    };
    const Le = a.cwrap("Vector2Invert", "void", ["pointer", "pointer"]);
    e.Vector2Invert = s => {
        const o = new e.Vector2;
        return Le(o._address, s._address), o
    };
    const Ie = a.cwrap("Vector2Clamp", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.Vector2Clamp = (s, o, l) => {
        const d = new e.Vector2;
        return Ie(d._address, s._address, o._address, l._address), d
    };
    const Te = a.cwrap("Vector2ClampValue", "void", ["pointer", "pointer", "number", "number"]);
    e.Vector2ClampValue = (s, o, l) => {
        const d = new e.Vector2;
        return Te(d._address, s._address, o, l), d
    };
    const be = a.cwrap("Vector2Equals", "number", ["pointer", "pointer"]);
    e.Vector2Equals = (s, o) => be(s._address, o._address);
    const Ae = a.cwrap("Vector3Zero", "void", ["pointer"]);
    e.Vector3Zero = () => {
        const s = new e.Vector3;
        return Ae(s._address), s
    };
    const we = a.cwrap("Vector3One", "void", ["pointer"]);
    e.Vector3One = () => {
        const s = new e.Vector3;
        return we(s._address), s
    };
    const Oe = a.cwrap("Vector3Add", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Add = (s, o) => {
        const l = new e.Vector3;
        return Oe(l._address, s._address, o._address), l
    };
    const ge = a.cwrap("Vector3AddValue", "void", ["pointer", "pointer", "number"]);
    e.Vector3AddValue = (s, o) => {
        const l = new e.Vector3;
        return ge(l._address, s._address, o), l
    };
    const Ge = a.cwrap("Vector3Subtract", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Subtract = (s, o) => {
        const l = new e.Vector3;
        return Ge(l._address, s._address, o._address), l
    };
    const De = a.cwrap("Vector3SubtractValue", "void", ["pointer", "pointer", "number"]);
    e.Vector3SubtractValue = (s, o) => {
        const l = new e.Vector3;
        return De(l._address, s._address, o), l
    };
    const he = a.cwrap("Vector3Scale", "void", ["pointer", "pointer", "number"]);
    e.Vector3Scale = (s, o) => {
        const l = new e.Vector3;
        return he(l._address, s._address, o), l
    };
    const fe = a.cwrap("Vector3Multiply", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Multiply = (s, o) => {
        const l = new e.Vector3;
        return fe(l._address, s._address, o._address), l
    };
    const xe = a.cwrap("Vector3CrossProduct", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3CrossProduct = (s, o) => {
        const l = new e.Vector3;
        return xe(l._address, s._address, o._address), l
    };
    const ye = a.cwrap("Vector3Perpendicular", "void", ["pointer", "pointer"]);
    e.Vector3Perpendicular = s => {
        const o = new e.Vector3;
        return ye(o._address, s._address), o
    };
    const Pe = a.cwrap("Vector3Length", "number", ["pointer"]);
    e.Vector3Length = s => Pe(s._address);
    const Fe = a.cwrap("Vector3LengthSqr", "number", ["pointer"]);
    e.Vector3LengthSqr = s => Fe(s._address);
    const Ne = a.cwrap("Vector3DotProduct", "number", ["pointer", "pointer"]);
    e.Vector3DotProduct = (s, o) => Ne(s._address, o._address);
    const ve = a.cwrap("Vector3Distance", "number", ["pointer", "pointer"]);
    e.Vector3Distance = (s, o) => ve(s._address, o._address);
    const Be = a.cwrap("Vector3DistanceSqr", "number", ["pointer", "pointer"]);
    e.Vector3DistanceSqr = (s, o) => Be(s._address, o._address);
    const Ve = a.cwrap("Vector3Angle", "number", ["pointer", "pointer"]);
    e.Vector3Angle = (s, o) => Ve(s._address, o._address);
    const Ue = a.cwrap("Vector3Negate", "void", ["pointer", "pointer"]);
    e.Vector3Negate = s => {
        const o = new e.Vector3;
        return Ue(o._address, s._address), o
    };
    const He = a.cwrap("Vector3Divide", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Divide = (s, o) => {
        const l = new e.Vector3;
        return He(l._address, s._address, o._address), l
    };
    const We = a.cwrap("Vector3Normalize", "void", ["pointer", "pointer"]);
    e.Vector3Normalize = s => {
        const o = new e.Vector3;
        return We(o._address, s._address), o
    };
    const ke = a.cwrap("Vector3Project", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Project = (s, o) => {
        const l = new e.Vector3;
        return ke(l._address, s._address, o._address), l
    };
    const Xe = a.cwrap("Vector3Reject", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Reject = (s, o) => {
        const l = new e.Vector3;
        return Xe(l._address, s._address, o._address), l
    };
    const Ye = a.cwrap("Vector3OrthoNormalize", "pointer", ["pointer", "pointer"]);
    e.Vector3OrthoNormalize = (s, o) => Ye(s._address, o._address);
    const Ke = a.cwrap("Vector3Transform", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Transform = (s, o) => {
        const l = new e.Vector3;
        return Ke(l._address, s._address, o._address), l
    };
    const ze = a.cwrap("Vector3RotateByQuaternion", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3RotateByQuaternion = (s, o) => {
        const l = new e.Vector3;
        return ze(l._address, s._address, o._address), l
    };
    const Qe = a.cwrap("Vector3RotateByAxisAngle", "void", ["pointer", "pointer", "pointer", "number"]);
    e.Vector3RotateByAxisAngle = (s, o, l) => {
        const d = new e.Vector3;
        return Qe(d._address, s._address, o._address, l), d
    };
    const qe = a.cwrap("Vector3Lerp", "void", ["pointer", "pointer", "pointer", "number"]);
    e.Vector3Lerp = (s, o, l) => {
        const d = new e.Vector3;
        return qe(d._address, s._address, o._address, l), d
    };
    const je = a.cwrap("Vector3Reflect", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Reflect = (s, o) => {
        const l = new e.Vector3;
        return je(l._address, s._address, o._address), l
    };
    const Ze = a.cwrap("Vector3Min", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Min = (s, o) => {
        const l = new e.Vector3;
        return Ze(l._address, s._address, o._address), l
    };
    const Je = a.cwrap("Vector3Max", "void", ["pointer", "pointer", "pointer"]);
    e.Vector3Max = (s, o) => {
        const l = new e.Vector3;
        return Je(l._address, s._address, o._address), l
    };
    const $e = a.cwrap("Vector3Barycenter", "void", ["pointer", "pointer", "pointer", "pointer", "pointer"]);
    e.Vector3Barycenter = (s, o, l, d) => {
        const E = new e.Vector3;
        return $e(E._address, s._address, o._address, l._address, d._address), E
    };
    const er = a.cwrap("Vector3Unproject", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.Vector3Unproject = (s, o, l) => {
        const d = new e.Vector3;
        return er(d._address, s._address, o._address, l._address), d
    };
    const rr = a.cwrap("Vector3ToFloatV", "void", ["pointer", "pointer"]);
    e.Vector3ToFloatV = s => {
        const o = new e.float3;
        return rr(o._address, s._address), o
    };
    const tr = a.cwrap("Vector3Invert", "void", ["pointer", "pointer"]);
    e.Vector3Invert = s => {
        const o = new e.Vector3;
        return tr(o._address, s._address), o
    };
    const ar = a.cwrap("Vector3Clamp", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.Vector3Clamp = (s, o, l) => {
        const d = new e.Vector3;
        return ar(d._address, s._address, o._address, l._address), d
    };
    const or = a.cwrap("Vector3ClampValue", "void", ["pointer", "pointer", "number", "number"]);
    e.Vector3ClampValue = (s, o, l) => {
        const d = new e.Vector3;
        return or(d._address, s._address, o, l), d
    };
    const nr = a.cwrap("Vector3Equals", "number", ["pointer", "pointer"]);
    e.Vector3Equals = (s, o) => nr(s._address, o._address);
    const sr = a.cwrap("Vector3Refract", "void", ["pointer", "pointer", "pointer", "number"]);
    e.Vector3Refract = (s, o, l) => {
        const d = new e.Vector3;
        return sr(d._address, s._address, o._address, l), d
    };
    const ir = a.cwrap("MatrixDeterminant", "number", ["pointer"]);
    e.MatrixDeterminant = s => ir(s._address);
    const lr = a.cwrap("MatrixTrace", "number", ["pointer"]);
    e.MatrixTrace = s => lr(s._address);
    const _r = a.cwrap("MatrixTranspose", "void", ["pointer", "pointer"]);
    e.MatrixTranspose = s => {
        const o = new e.Matrix;
        return _r(o._address, s._address), o
    };
    const dr = a.cwrap("MatrixInvert", "void", ["pointer", "pointer"]);
    e.MatrixInvert = s => {
        const o = new e.Matrix;
        return dr(o._address, s._address), o
    };
    const ur = a.cwrap("MatrixIdentity", "void", ["pointer"]);
    e.MatrixIdentity = () => {
        const s = new e.Matrix;
        return ur(s._address), s
    };
    const cr = a.cwrap("MatrixAdd", "void", ["pointer", "pointer", "pointer"]);
    e.MatrixAdd = (s, o) => {
        const l = new e.Matrix;
        return cr(l._address, s._address, o._address), l
    };
    const Er = a.cwrap("MatrixSubtract", "void", ["pointer", "pointer", "pointer"]);
    e.MatrixSubtract = (s, o) => {
        const l = new e.Matrix;
        return Er(l._address, s._address, o._address), l
    };
    const mr = a.cwrap("MatrixMultiply", "void", ["pointer", "pointer", "pointer"]);
    e.MatrixMultiply = (s, o) => {
        const l = new e.Matrix;
        return mr(l._address, s._address, o._address), l
    };
    const pr = a.cwrap("MatrixTranslate", "void", ["pointer", "number", "number", "number"]);
    e.MatrixTranslate = (s, o, l) => {
        const d = new e.Matrix;
        return pr(d._address, s, o, l), d
    };
    const Mr = a.cwrap("MatrixRotate", "void", ["pointer", "pointer", "number"]);
    e.MatrixRotate = (s, o) => {
        const l = new e.Matrix;
        return Mr(l._address, s._address, o), l
    };
    const Sr = a.cwrap("MatrixRotateX", "void", ["pointer", "number"]);
    e.MatrixRotateX = s => {
        const o = new e.Matrix;
        return Sr(o._address, s), o
    };
    const Cr = a.cwrap("MatrixRotateY", "void", ["pointer", "number"]);
    e.MatrixRotateY = s => {
        const o = new e.Matrix;
        return Cr(o._address, s), o
    };
    const Rr = a.cwrap("MatrixRotateZ", "void", ["pointer", "number"]);
    e.MatrixRotateZ = s => {
        const o = new e.Matrix;
        return Rr(o._address, s), o
    };
    const Lr = a.cwrap("MatrixRotateXYZ", "void", ["pointer", "pointer"]);
    e.MatrixRotateXYZ = s => {
        const o = new e.Matrix;
        return Lr(o._address, s._address), o
    };
    const Ir = a.cwrap("MatrixRotateZYX", "void", ["pointer", "pointer"]);
    e.MatrixRotateZYX = s => {
        const o = new e.Matrix;
        return Ir(o._address, s._address), o
    };
    const Tr = a.cwrap("MatrixScale", "void", ["pointer", "number", "number", "number"]);
    e.MatrixScale = (s, o, l) => {
        const d = new e.Matrix;
        return Tr(d._address, s, o, l), d
    };
    const br = a.cwrap("MatrixFrustum", "void", ["pointer", "number", "number", "number", "number", "number", "number"]);
    e.MatrixFrustum = (s, o, l, d, E, p) => {
        const b = new e.Matrix;
        return br(b._address, s, o, l, d, E, p), b
    };
    const Ar = a.cwrap("MatrixPerspective", "void", ["pointer", "number", "number", "number", "number"]);
    e.MatrixPerspective = (s, o, l, d) => {
        const E = new e.Matrix;
        return Ar(E._address, s, o, l, d), E
    };
    const wr = a.cwrap("MatrixOrtho", "void", ["pointer", "number", "number", "number", "number", "number", "number"]);
    e.MatrixOrtho = (s, o, l, d, E, p) => {
        const b = new e.Matrix;
        return wr(b._address, s, o, l, d, E, p), b
    };
    const Or = a.cwrap("MatrixLookAt", "void", ["pointer", "pointer", "pointer", "pointer"]);
    e.MatrixLookAt = (s, o, l) => {
        const d = new e.Matrix;
        return Or(d._address, s._address, o._address, l._address), d
    };
    const gr = a.cwrap("MatrixToFloatV", "void", ["pointer", "pointer"]);
    e.MatrixToFloatV = s => {
        const o = new e.float16;
        return gr(o._address, s._address), o
    };
    const Gr = a.cwrap("QuaternionAdd", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionAdd = (s, o) => {
        const l = new e.Quaternion;
        return Gr(l._address, s._address, o._address), l
    };
    const Dr = a.cwrap("QuaternionAddValue", "void", ["pointer", "pointer", "number"]);
    e.QuaternionAddValue = (s, o) => {
        const l = new e.Quaternion;
        return Dr(l._address, s._address, o), l
    };
    const hr = a.cwrap("QuaternionSubtract", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionSubtract = (s, o) => {
        const l = new e.Quaternion;
        return hr(l._address, s._address, o._address), l
    };
    const fr = a.cwrap("QuaternionSubtractValue", "void", ["pointer", "pointer", "number"]);
    e.QuaternionSubtractValue = (s, o) => {
        const l = new e.Quaternion;
        return fr(l._address, s._address, o), l
    };
    const xr = a.cwrap("QuaternionIdentity", "void", ["pointer"]);
    e.QuaternionIdentity = () => {
        const s = new e.Quaternion;
        return xr(s._address), s
    };
    const yr = a.cwrap("QuaternionLength", "number", ["pointer"]);
    e.QuaternionLength = s => yr(s._address);
    const Pr = a.cwrap("QuaternionNormalize", "void", ["pointer", "pointer"]);
    e.QuaternionNormalize = s => {
        const o = new e.Quaternion;
        return Pr(o._address, s._address), o
    };
    const Fr = a.cwrap("QuaternionInvert", "void", ["pointer", "pointer"]);
    e.QuaternionInvert = s => {
        const o = new e.Quaternion;
        return Fr(o._address, s._address), o
    };
    const Nr = a.cwrap("QuaternionMultiply", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionMultiply = (s, o) => {
        const l = new e.Quaternion;
        return Nr(l._address, s._address, o._address), l
    };
    const vr = a.cwrap("QuaternionScale", "void", ["pointer", "pointer", "number"]);
    e.QuaternionScale = (s, o) => {
        const l = new e.Quaternion;
        return vr(l._address, s._address, o), l
    };
    const Br = a.cwrap("QuaternionDivide", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionDivide = (s, o) => {
        const l = new e.Quaternion;
        return Br(l._address, s._address, o._address), l
    };
    const Vr = a.cwrap("QuaternionLerp", "void", ["pointer", "pointer", "pointer", "number"]);
    e.QuaternionLerp = (s, o, l) => {
        const d = new e.Quaternion;
        return Vr(d._address, s._address, o._address, l), d
    };
    const Ur = a.cwrap("QuaternionNlerp", "void", ["pointer", "pointer", "pointer", "number"]);
    e.QuaternionNlerp = (s, o, l) => {
        const d = new e.Quaternion;
        return Ur(d._address, s._address, o._address, l), d
    };
    const Hr = a.cwrap("QuaternionSlerp", "void", ["pointer", "pointer", "pointer", "number"]);
    e.QuaternionSlerp = (s, o, l) => {
        const d = new e.Quaternion;
        return Hr(d._address, s._address, o._address, l), d
    };
    const Wr = a.cwrap("QuaternionFromVector3ToVector3", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionFromVector3ToVector3 = (s, o) => {
        const l = new e.Quaternion;
        return Wr(l._address, s._address, o._address), l
    };
    const kr = a.cwrap("QuaternionFromMatrix", "void", ["pointer", "pointer"]);
    e.QuaternionFromMatrix = s => {
        const o = new e.Quaternion;
        return kr(o._address, s._address), o
    };
    const Xr = a.cwrap("QuaternionToMatrix", "void", ["pointer", "pointer"]);
    e.QuaternionToMatrix = s => {
        const o = new e.Matrix;
        return Xr(o._address, s._address), o
    };
    const Yr = a.cwrap("QuaternionFromAxisAngle", "void", ["pointer", "pointer", "number"]);
    e.QuaternionFromAxisAngle = (s, o) => {
        const l = new e.Quaternion;
        return Yr(l._address, s._address, o), l
    };
    const Kr = a.cwrap("QuaternionToAxisAngle", "pointer", ["pointer", "pointer", "pointer"]);
    e.QuaternionToAxisAngle = (s, o, l) => Kr(s._address, o._address, l._address);
    const zr = a.cwrap("QuaternionFromEuler", "void", ["pointer", "number", "number", "number"]);
    e.QuaternionFromEuler = (s, o, l) => {
        const d = new e.Quaternion;
        return zr(d._address, s, o, l), d
    };
    const Qr = a.cwrap("QuaternionToEuler", "void", ["pointer", "pointer"]);
    e.QuaternionToEuler = s => {
        const o = new e.Vector3;
        return Qr(o._address, s._address), o
    };
    const qr = a.cwrap("QuaternionTransform", "void", ["pointer", "pointer", "pointer"]);
    e.QuaternionTransform = (s, o) => {
        const l = new e.Quaternion;
        return qr(l._address, s._address, o._address), l
    };
    const jr = a.cwrap("QuaternionEquals", "number", ["pointer", "pointer"]);
    e.QuaternionEquals = (s, o) => jr(s._address, o._address);
    const Zr = a.cwrap("EaseLinearNone", "number", ["number", "number", "number", "number"]);
    e.EaseLinearNone = (s, o, l, d) => Zr(s, o, l, d);
    const Jr = a.cwrap("EaseLinearIn", "number", ["number", "number", "number", "number"]);
    e.EaseLinearIn = (s, o, l, d) => Jr(s, o, l, d);
    const $r = a.cwrap("EaseLinearOut", "number", ["number", "number", "number", "number"]);
    e.EaseLinearOut = (s, o, l, d) => $r(s, o, l, d);
    const et = a.cwrap("EaseLinearInOut", "number", ["number", "number", "number", "number"]);
    e.EaseLinearInOut = (s, o, l, d) => et(s, o, l, d);
    const rt = a.cwrap("EaseSineIn", "number", ["number", "number", "number", "number"]);
    e.EaseSineIn = (s, o, l, d) => rt(s, o, l, d);
    const tt = a.cwrap("EaseSineOut", "number", ["number", "number", "number", "number"]);
    e.EaseSineOut = (s, o, l, d) => tt(s, o, l, d);
    const at = a.cwrap("EaseSineInOut", "number", ["number", "number", "number", "number"]);
    e.EaseSineInOut = (s, o, l, d) => at(s, o, l, d);
    const ot = a.cwrap("EaseCircIn", "number", ["number", "number", "number", "number"]);
    e.EaseCircIn = (s, o, l, d) => ot(s, o, l, d);
    const nt = a.cwrap("EaseCircOut", "number", ["number", "number", "number", "number"]);
    e.EaseCircOut = (s, o, l, d) => nt(s, o, l, d);
    const st = a.cwrap("EaseCircInOut", "number", ["number", "number", "number", "number"]);
    e.EaseCircInOut = (s, o, l, d) => st(s, o, l, d);
    const it = a.cwrap("EaseCubicIn", "number", ["number", "number", "number", "number"]);
    e.EaseCubicIn = (s, o, l, d) => it(s, o, l, d);
    const lt = a.cwrap("EaseCubicOut", "number", ["number", "number", "number", "number"]);
    e.EaseCubicOut = (s, o, l, d) => lt(s, o, l, d);
    const _t = a.cwrap("EaseCubicInOut", "number", ["number", "number", "number", "number"]);
    e.EaseCubicInOut = (s, o, l, d) => _t(s, o, l, d);
    const dt = a.cwrap("EaseQuadIn", "number", ["number", "number", "number", "number"]);
    e.EaseQuadIn = (s, o, l, d) => dt(s, o, l, d);
    const ut = a.cwrap("EaseQuadOut", "number", ["number", "number", "number", "number"]);
    e.EaseQuadOut = (s, o, l, d) => ut(s, o, l, d);
    const ct = a.cwrap("EaseQuadInOut", "number", ["number", "number", "number", "number"]);
    e.EaseQuadInOut = (s, o, l, d) => ct(s, o, l, d);
    const Et = a.cwrap("EaseExpoIn", "number", ["number", "number", "number", "number"]);
    e.EaseExpoIn = (s, o, l, d) => Et(s, o, l, d);
    const mt = a.cwrap("EaseExpoOut", "number", ["number", "number", "number", "number"]);
    e.EaseExpoOut = (s, o, l, d) => mt(s, o, l, d);
    const pt = a.cwrap("EaseExpoInOut", "number", ["number", "number", "number", "number"]);
    e.EaseExpoInOut = (s, o, l, d) => pt(s, o, l, d);
    const Mt = a.cwrap("EaseBackIn", "number", ["number", "number", "number", "number"]);
    e.EaseBackIn = (s, o, l, d) => Mt(s, o, l, d);
    const St = a.cwrap("EaseBackOut", "number", ["number", "number", "number", "number"]);
    e.EaseBackOut = (s, o, l, d) => St(s, o, l, d);
    const Ct = a.cwrap("EaseBackInOut", "number", ["number", "number", "number", "number"]);
    e.EaseBackInOut = (s, o, l, d) => Ct(s, o, l, d);
    const Rt = a.cwrap("EaseBounceOut", "number", ["number", "number", "number", "number"]);
    e.EaseBounceOut = (s, o, l, d) => Rt(s, o, l, d);
    const Lt = a.cwrap("EaseBounceIn", "number", ["number", "number", "number", "number"]);
    e.EaseBounceIn = (s, o, l, d) => Lt(s, o, l, d);
    const It = a.cwrap("EaseBounceInOut", "number", ["number", "number", "number", "number"]);
    e.EaseBounceInOut = (s, o, l, d) => It(s, o, l, d);
    const Tt = a.cwrap("EaseElasticIn", "number", ["number", "number", "number", "number"]);
    e.EaseElasticIn = (s, o, l, d) => Tt(s, o, l, d);
    const bt = a.cwrap("EaseElasticOut", "number", ["number", "number", "number", "number"]);
    e.EaseElasticOut = (s, o, l, d) => bt(s, o, l, d);
    const At = a.cwrap("EaseElasticInOut", "number", ["number", "number", "number", "number"]);
    e.EaseElasticInOut = (s, o, l, d) => At(s, o, l, d);
    const wt = a.cwrap("rlMatrixMode", "pointer", ["number"]);
    e.rlMatrixMode = s => wt(s);
    const Ot = a.cwrap("rlPushMatrix", "pointer", []);
    e.rlPushMatrix = () => Ot();
    const gt = a.cwrap("rlPopMatrix", "pointer", []);
    e.rlPopMatrix = () => gt();
    const Gt = a.cwrap("rlLoadIdentity", "pointer", []);
    e.rlLoadIdentity = () => Gt();
    const Dt = a.cwrap("rlTranslatef", "pointer", ["number", "number", "number"]);
    e.rlTranslatef = (s, o, l) => Dt(s, o, l);
    const ht = a.cwrap("rlRotatef", "pointer", ["number", "number", "number", "number"]);
    e.rlRotatef = (s, o, l, d) => ht(s, o, l, d);
    const ft = a.cwrap("rlScalef", "pointer", ["number", "number", "number"]);
    e.rlScalef = (s, o, l) => ft(s, o, l);
    const xt = a.cwrap("rlMultMatrixf", "pointer", ["pointer"]);
    e.rlMultMatrixf = s => xt(s._address);
    const yt = a.cwrap("rlFrustum", "pointer", ["number", "number", "number", "number", "number", "number"]);
    e.rlFrustum = (s, o, l, d, E, p) => yt(s, o, l, d, E, p);
    const Pt = a.cwrap("rlOrtho", "pointer", ["number", "number", "number", "number", "number", "number"]);
    e.rlOrtho = (s, o, l, d, E, p) => Pt(s, o, l, d, E, p);
    const Ft = a.cwrap("rlViewport", "pointer", ["number", "number", "number", "number"]);
    e.rlViewport = (s, o, l, d) => Ft(s, o, l, d);
    const Nt = a.cwrap("rlBegin", "pointer", ["number"]);
    e.rlBegin = s => Nt(s);
    const vt = a.cwrap("rlEnd", "pointer", []);
    e.rlEnd = () => vt();
    const Bt = a.cwrap("rlVertex2i", "pointer", ["number", "number"]);
    e.rlVertex2i = (s, o) => Bt(s, o);
    const Vt = a.cwrap("rlVertex2f", "pointer", ["number", "number"]);
    e.rlVertex2f = (s, o) => Vt(s, o);
    const Ut = a.cwrap("rlVertex3f", "pointer", ["number", "number", "number"]);
    e.rlVertex3f = (s, o, l) => Ut(s, o, l);
    const Ht = a.cwrap("rlTexCoord2f", "pointer", ["number", "number"]);
    e.rlTexCoord2f = (s, o) => Ht(s, o);
    const Wt = a.cwrap("rlNormal3f", "pointer", ["number", "number", "number"]);
    e.rlNormal3f = (s, o, l) => Wt(s, o, l);
    const kt = a.cwrap("rlColor4ub", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.rlColor4ub = (s, o, l, d) => kt(s._address, o._address, l._address, d._address);
    const Xt = a.cwrap("rlColor3f", "pointer", ["number", "number", "number"]);
    e.rlColor3f = (s, o, l) => Xt(s, o, l);
    const Yt = a.cwrap("rlColor4f", "pointer", ["number", "number", "number", "number"]);
    e.rlColor4f = (s, o, l, d) => Yt(s, o, l, d);
    const Kt = a.cwrap("rlEnableVertexArray", "boolean", ["number"]);
    e.rlEnableVertexArray = s => Kt(s);
    const zt = a.cwrap("rlDisableVertexArray", "pointer", []);
    e.rlDisableVertexArray = () => zt();
    const Qt = a.cwrap("rlEnableVertexBuffer", "pointer", ["number"]);
    e.rlEnableVertexBuffer = s => Qt(s);
    const qt = a.cwrap("rlDisableVertexBuffer", "pointer", []);
    e.rlDisableVertexBuffer = () => qt();
    const jt = a.cwrap("rlEnableVertexBufferElement", "pointer", ["number"]);
    e.rlEnableVertexBufferElement = s => jt(s);
    const Zt = a.cwrap("rlDisableVertexBufferElement", "pointer", []);
    e.rlDisableVertexBufferElement = () => Zt();
    const Jt = a.cwrap("rlEnableVertexAttribute", "pointer", ["number"]);
    e.rlEnableVertexAttribute = s => Jt(s);
    const $t = a.cwrap("rlDisableVertexAttribute", "pointer", ["number"]);
    e.rlDisableVertexAttribute = s => $t(s);
    const ea = a.cwrap("rlActiveTextureSlot", "pointer", ["number"]);
    e.rlActiveTextureSlot = s => ea(s);
    const ra = a.cwrap("rlEnableTexture", "pointer", ["number"]);
    e.rlEnableTexture = s => ra(s);
    const ta = a.cwrap("rlDisableTexture", "pointer", []);
    e.rlDisableTexture = () => ta();
    const aa = a.cwrap("rlEnableTextureCubemap", "pointer", ["number"]);
    e.rlEnableTextureCubemap = s => aa(s);
    const oa = a.cwrap("rlDisableTextureCubemap", "pointer", []);
    e.rlDisableTextureCubemap = () => oa();
    const na = a.cwrap("rlTextureParameters", "pointer", ["number", "number", "number"]);
    e.rlTextureParameters = (s, o, l) => na(s, o, l);
    const sa = a.cwrap("rlCubemapParameters", "pointer", ["number", "number", "number"]);
    e.rlCubemapParameters = (s, o, l) => sa(s, o, l);
    const ia = a.cwrap("rlEnableShader", "pointer", ["number"]);
    e.rlEnableShader = s => ia(s);
    const la = a.cwrap("rlDisableShader", "pointer", []);
    e.rlDisableShader = () => la();
    const _a = a.cwrap("rlEnableFramebuffer", "pointer", ["number"]);
    e.rlEnableFramebuffer = s => _a(s);
    const da = a.cwrap("rlDisableFramebuffer", "pointer", []);
    e.rlDisableFramebuffer = () => da();
    const ua = a.cwrap("rlActiveDrawBuffers", "pointer", ["number"]);
    e.rlActiveDrawBuffers = s => ua(s);
    const ca = a.cwrap("rlEnableColorBlend", "pointer", []);
    e.rlEnableColorBlend = () => ca();
    const Ea = a.cwrap("rlDisableColorBlend", "pointer", []);
    e.rlDisableColorBlend = () => Ea();
    const ma = a.cwrap("rlEnableDepthTest", "pointer", []);
    e.rlEnableDepthTest = () => ma();
    const pa = a.cwrap("rlDisableDepthTest", "pointer", []);
    e.rlDisableDepthTest = () => pa();
    const Ma = a.cwrap("rlEnableDepthMask", "pointer", []);
    e.rlEnableDepthMask = () => Ma();
    const Sa = a.cwrap("rlDisableDepthMask", "pointer", []);
    e.rlDisableDepthMask = () => Sa();
    const Ca = a.cwrap("rlEnableBackfaceCulling", "pointer", []);
    e.rlEnableBackfaceCulling = () => Ca();
    const Ra = a.cwrap("rlDisableBackfaceCulling", "pointer", []);
    e.rlDisableBackfaceCulling = () => Ra();
    const La = a.cwrap("rlSetCullFace", "pointer", ["number"]);
    e.rlSetCullFace = s => La(s);
    const Ia = a.cwrap("rlEnableScissorTest", "pointer", []);
    e.rlEnableScissorTest = () => Ia();
    const Ta = a.cwrap("rlDisableScissorTest", "pointer", []);
    e.rlDisableScissorTest = () => Ta();
    const ba = a.cwrap("rlScissor", "pointer", ["number", "number", "number", "number"]);
    e.rlScissor = (s, o, l, d) => ba(s, o, l, d);
    const Aa = a.cwrap("rlEnableWireMode", "pointer", []);
    e.rlEnableWireMode = () => Aa();
    const wa = a.cwrap("rlDisableWireMode", "pointer", []);
    e.rlDisableWireMode = () => wa();
    const Oa = a.cwrap("rlSetLineWidth", "pointer", ["number"]);
    e.rlSetLineWidth = s => Oa(s);
    const ga = a.cwrap("rlGetLineWidth", "number", []);
    e.rlGetLineWidth = () => ga();
    const Ga = a.cwrap("rlEnableSmoothLines", "pointer", []);
    e.rlEnableSmoothLines = () => Ga();
    const Da = a.cwrap("rlDisableSmoothLines", "pointer", []);
    e.rlDisableSmoothLines = () => Da();
    const ha = a.cwrap("rlEnableStereoRender", "pointer", []);
    e.rlEnableStereoRender = () => ha();
    const fa = a.cwrap("rlDisableStereoRender", "pointer", []);
    e.rlDisableStereoRender = () => fa();
    const xa = a.cwrap("rlIsStereoRenderEnabled", "boolean", []);
    e.rlIsStereoRenderEnabled = () => xa();
    const ya = a.cwrap("rlClearColor", "pointer", ["pointer", "pointer", "pointer", "pointer"]);
    e.rlClearColor = (s, o, l, d) => ya(s._address, o._address, l._address, d._address);
    const Pa = a.cwrap("rlClearScreenBuffers", "pointer", []);
    e.rlClearScreenBuffers = () => Pa();
    const Fa = a.cwrap("rlCheckErrors", "pointer", []);
    e.rlCheckErrors = () => Fa();
    const Na = a.cwrap("rlSetBlendMode", "pointer", ["number"]);
    e.rlSetBlendMode = s => Na(s);
    const va = a.cwrap("rlSetBlendFactors", "pointer", ["number", "number", "number"]);
    e.rlSetBlendFactors = (s, o, l) => va(s, o, l);
    const Ba = a.cwrap("rlSetBlendFactorsSeparate", "pointer", ["number", "number", "number", "number", "number", "number"]);
    e.rlSetBlendFactorsSeparate = (s, o, l, d, E, p) => Ba(s, o, l, d, E, p);
    const Va = a.cwrap("rlglInit", "pointer", ["number", "number"]);
    e.rlglInit = (s, o) => Va(s, o);
    const Ua = a.cwrap("rlglClose", "pointer", []);
    e.rlglClose = () => Ua();
    const Ha = a.cwrap("rlLoadExtensions", "pointer", ["pointer"]);
    e.rlLoadExtensions = s => Ha(s._address);
    const Wa = a.cwrap("rlGetVersion", "number", []);
    e.rlGetVersion = () => Wa();
    const ka = a.cwrap("rlSetFramebufferWidth", "pointer", ["number"]);
    e.rlSetFramebufferWidth = s => ka(s);
    const Xa = a.cwrap("rlGetFramebufferWidth", "number", []);
    e.rlGetFramebufferWidth = () => Xa();
    const Ya = a.cwrap("rlSetFramebufferHeight", "pointer", ["number"]);
    e.rlSetFramebufferHeight = s => Ya(s);
    const Ka = a.cwrap("rlGetFramebufferHeight", "number", []);
    e.rlGetFramebufferHeight = () => Ka();
    const za = a.cwrap("rlGetTextureIdDefault", "number", []);
    e.rlGetTextureIdDefault = () => za();
    const Qa = a.cwrap("rlGetShaderIdDefault", "number", []);
    e.rlGetShaderIdDefault = () => Qa();
    const qa = a.cwrap("rlGetShaderLocsDefault", "pointer", []);
    e.rlGetShaderLocsDefault = () => qa();
    const ja = a.cwrap("rlLoadRenderBatch", "void", ["pointer", "number", "number"]);
    e.rlLoadRenderBatch = (s, o) => {
        const l = new e.rlRenderBatch;
        return ja(l._address, s, o), l
    };
    const Za = a.cwrap("rlUnloadRenderBatch", "pointer", ["pointer"]);
    e.rlUnloadRenderBatch = s => Za(s._address);
    const Ja = a.cwrap("rlDrawRenderBatch", "pointer", ["pointer"]);
    e.rlDrawRenderBatch = s => Ja(s._address);
    const $a = a.cwrap("rlSetRenderBatchActive", "pointer", ["pointer"]);
    e.rlSetRenderBatchActive = s => $a(s._address);
    const eo = a.cwrap("rlDrawRenderBatchActive", "pointer", []);
    e.rlDrawRenderBatchActive = () => eo();
    const ro = a.cwrap("rlCheckRenderBatchLimit", "boolean", ["number"]);
    e.rlCheckRenderBatchLimit = s => ro(s);
    const to = a.cwrap("rlSetTexture", "pointer", ["number"]);
    e.rlSetTexture = s => to(s);
    const ao = a.cwrap("rlLoadVertexArray", "number", []);
    e.rlLoadVertexArray = () => ao();
    const oo = a.cwrap("rlLoadVertexBuffer", "number", ["pointer", "number", "boolean"]);
    e.rlLoadVertexBuffer = (s, o, l) => oo(s._address, o, l);
    const no = a.cwrap("rlLoadVertexBufferElement", "number", ["pointer", "number", "boolean"]);
    e.rlLoadVertexBufferElement = (s, o, l) => no(s._address, o, l);
    const so = a.cwrap("rlUpdateVertexBuffer", "pointer", ["number", "pointer", "number", "number"]);
    e.rlUpdateVertexBuffer = (s, o, l, d) => so(s, o._address, l, d);
    const io = a.cwrap("rlUpdateVertexBufferElements", "pointer", ["number", "pointer", "number", "number"]);
    e.rlUpdateVertexBufferElements = (s, o, l, d) => io(s, o._address, l, d);
    const lo = a.cwrap("rlUnloadVertexArray", "pointer", ["number"]);
    e.rlUnloadVertexArray = s => lo(s);
    const _o = a.cwrap("rlUnloadVertexBuffer", "pointer", ["number"]);
    e.rlUnloadVertexBuffer = s => _o(s);
    const uo = a.cwrap("rlSetVertexAttribute", "pointer", ["number", "number", "number", "boolean", "number", "pointer"]);
    e.rlSetVertexAttribute = (s, o, l, d, E, p) => uo(s, o, l, d, E, p._address);
    const co = a.cwrap("rlSetVertexAttributeDivisor", "pointer", ["number", "number"]);
    e.rlSetVertexAttributeDivisor = (s, o) => co(s, o);
    const Eo = a.cwrap("rlSetVertexAttributeDefault", "pointer", ["number", "pointer", "number", "number"]);
    e.rlSetVertexAttributeDefault = (s, o, l, d) => Eo(s, o._address, l, d);
    const mo = a.cwrap("rlDrawVertexArray", "pointer", ["number", "number"]);
    e.rlDrawVertexArray = (s, o) => mo(s, o);
    const po = a.cwrap("rlDrawVertexArrayElements", "pointer", ["number", "number", "pointer"]);
    e.rlDrawVertexArrayElements = (s, o, l) => po(s, o, l._address);
    const Mo = a.cwrap("rlDrawVertexArrayInstanced", "pointer", ["number", "number", "number"]);
    e.rlDrawVertexArrayInstanced = (s, o, l) => Mo(s, o, l);
    const So = a.cwrap("rlDrawVertexArrayElementsInstanced", "pointer", ["number", "number", "pointer", "number"]);
    e.rlDrawVertexArrayElementsInstanced = (s, o, l, d) => So(s, o, l._address, d);
    const Co = a.cwrap("rlLoadTexture", "number", ["pointer", "number", "number", "number", "number"]);
    e.rlLoadTexture = (s, o, l, d, E) => Co(s._address, o, l, d, E);
    const Ro = a.cwrap("rlLoadTextureDepth", "number", ["number", "number", "boolean"]);
    e.rlLoadTextureDepth = (s, o, l) => Ro(s, o, l);
    const Lo = a.cwrap("rlLoadTextureCubemap", "number", ["pointer", "number", "number"]);
    e.rlLoadTextureCubemap = (s, o, l) => Lo(s._address, o, l);
    const Io = a.cwrap("rlUpdateTexture", "pointer", ["number", "number", "number", "number", "number", "number", "pointer"]);
    e.rlUpdateTexture = (s, o, l, d, E, p, b) => Io(s, o, l, d, E, p, b._address);
    const To = a.cwrap("rlGetGlTextureFormats", "pointer", ["number", "pointer", "pointer", "pointer"]);
    e.rlGetGlTextureFormats = (s, o, l, d) => To(s, o._address, l._address, d._address);
    const bo = a.cwrap("rlGetPixelFormatName", "string", ["number"]);
    e.rlGetPixelFormatName = s => bo(s);
    const Ao = a.cwrap("rlUnloadTexture", "pointer", ["number"]);
    e.rlUnloadTexture = s => Ao(s);
    const wo = a.cwrap("rlGenTextureMipmaps", "pointer", ["number", "number", "number", "number", "pointer"]);
    e.rlGenTextureMipmaps = (s, o, l, d, E) => wo(s, o, l, d, E._address);
    const Oo = a.cwrap("rlReadTexturePixels", "pointer", ["number", "number", "number", "number"]);
    e.rlReadTexturePixels = (s, o, l, d) => Oo(s, o, l, d);
    const go = a.cwrap("rlReadScreenPixels", "pointer", ["number", "number"]);
    e.rlReadScreenPixels = (s, o) => go(s, o);
    const Go = a.cwrap("rlLoadFramebuffer", "number", ["number", "number"]);
    e.rlLoadFramebuffer = (s, o) => Go(s, o);
    const Do = a.cwrap("rlFramebufferAttach", "pointer", ["number", "number", "number", "number", "number"]);
    e.rlFramebufferAttach = (s, o, l, d, E) => Do(s, o, l, d, E);
    const ho = a.cwrap("rlFramebufferComplete", "boolean", ["number"]);
    e.rlFramebufferComplete = s => ho(s);
    const fo = a.cwrap("rlUnloadFramebuffer", "pointer", ["number"]);
    e.rlUnloadFramebuffer = s => fo(s);
    const xo = a.cwrap("rlLoadShaderCode", "number", ["string", "string"]);
    e.rlLoadShaderCode = (s, o) => xo(s, o);
    const yo = a.cwrap("rlCompileShader", "number", ["string", "number"]);
    e.rlCompileShader = (s, o) => yo(s, o);
    const Po = a.cwrap("rlLoadShaderProgram", "number", ["number", "number"]);
    e.rlLoadShaderProgram = (s, o) => Po(s, o);
    const Fo = a.cwrap("rlUnloadShaderProgram", "pointer", ["number"]);
    e.rlUnloadShaderProgram = s => Fo(s);
    const No = a.cwrap("rlGetLocationUniform", "number", ["number", "string"]);
    e.rlGetLocationUniform = (s, o) => No(s, o);
    const vo = a.cwrap("rlGetLocationAttrib", "number", ["number", "string"]);
    e.rlGetLocationAttrib = (s, o) => vo(s, o);
    const Bo = a.cwrap("rlSetUniform", "pointer", ["number", "pointer", "number", "number"]);
    e.rlSetUniform = (s, o, l, d) => Bo(s, o._address, l, d);
    const Vo = a.cwrap("rlSetUniformMatrix", "pointer", ["number", "pointer"]);
    e.rlSetUniformMatrix = (s, o) => Vo(s, o._address);
    const Uo = a.cwrap("rlSetUniformSampler", "pointer", ["number", "number"]);
    e.rlSetUniformSampler = (s, o) => Uo(s, o);
    const Ho = a.cwrap("rlSetShader", "pointer", ["number", "pointer"]);
    e.rlSetShader = (s, o) => Ho(s, o._address);
    const Wo = a.cwrap("rlLoadComputeShaderProgram", "number", ["number"]);
    e.rlLoadComputeShaderProgram = s => Wo(s);
    const ko = a.cwrap("rlComputeShaderDispatch", "pointer", ["number", "number", "number"]);
    e.rlComputeShaderDispatch = (s, o, l) => ko(s, o, l);
    const Xo = a.cwrap("rlLoadShaderBuffer", "number", ["number", "pointer", "number"]);
    e.rlLoadShaderBuffer = (s, o, l) => Xo(s, o._address, l);
    const Yo = a.cwrap("rlUnloadShaderBuffer", "pointer", ["number"]);
    e.rlUnloadShaderBuffer = s => Yo(s);
    const Ko = a.cwrap("rlUpdateShaderBuffer", "pointer", ["number", "pointer", "number", "number"]);
    e.rlUpdateShaderBuffer = (s, o, l, d) => Ko(s, o._address, l, d);
    const zo = a.cwrap("rlBindShaderBuffer", "pointer", ["number", "number"]);
    e.rlBindShaderBuffer = (s, o) => zo(s, o);
    const Qo = a.cwrap("rlReadShaderBuffer", "pointer", ["number", "pointer", "number", "number"]);
    e.rlReadShaderBuffer = (s, o, l, d) => Qo(s, o._address, l, d);
    const qo = a.cwrap("rlCopyShaderBuffer", "pointer", ["number", "number", "number", "number", "number"]);
    e.rlCopyShaderBuffer = (s, o, l, d, E) => qo(s, o, l, d, E);
    const jo = a.cwrap("rlGetShaderBufferSize", "number", ["number"]);
    e.rlGetShaderBufferSize = s => jo(s);
    const Zo = a.cwrap("rlBindImageTexture", "pointer", ["number", "number", "number", "boolean"]);
    e.rlBindImageTexture = (s, o, l, d) => Zo(s, o, l, d);
    const Jo = a.cwrap("rlGetMatrixModelview", "void", ["pointer"]);
    e.rlGetMatrixModelview = () => {
        const s = new e.Matrix;
        return Jo(s._address), s
    };
    const $o = a.cwrap("rlGetMatrixProjection", "void", ["pointer"]);
    e.rlGetMatrixProjection = () => {
        const s = new e.Matrix;
        return $o(s._address), s
    };
    const en = a.cwrap("rlGetMatrixTransform", "void", ["pointer"]);
    e.rlGetMatrixTransform = () => {
        const s = new e.Matrix;
        return en(s._address), s
    };
    const rn = a.cwrap("rlGetMatrixProjectionStereo", "void", ["pointer", "number"]);
    e.rlGetMatrixProjectionStereo = s => {
        const o = new e.Matrix;
        return rn(o._address, s), o
    };
    const tn = a.cwrap("rlGetMatrixViewOffsetStereo", "void", ["pointer", "number"]);
    e.rlGetMatrixViewOffsetStereo = s => {
        const o = new e.Matrix;
        return tn(o._address, s), o
    };
    const an = a.cwrap("rlSetMatrixProjection", "pointer", ["pointer"]);
    e.rlSetMatrixProjection = s => an(s._address);
    const on = a.cwrap("rlSetMatrixModelview", "pointer", ["pointer"]);
    e.rlSetMatrixModelview = s => on(s._address);
    const nn = a.cwrap("rlSetMatrixProjectionStereo", "pointer", ["pointer", "pointer"]);
    e.rlSetMatrixProjectionStereo = (s, o) => nn(s._address, o._address);
    const sn = a.cwrap("rlSetMatrixViewOffsetStereo", "pointer", ["pointer", "pointer"]);
    e.rlSetMatrixViewOffsetStereo = (s, o) => sn(s._address, o._address);
    const ln = a.cwrap("rlLoadDrawCube", "pointer", []);
    e.rlLoadDrawCube = () => ln();
    const _n = a.cwrap("rlLoadDrawQuad", "pointer", []);
    e.rlLoadDrawQuad = () => _n();
    const dn = a.cwrap("GetCameraForward", "void", ["pointer", "pointer"]);
    e.GetCameraForward = s => {
        const o = new e.Vector3;
        return dn(o._address, s._address), o
    };
    const un = a.cwrap("GetCameraUp", "void", ["pointer", "pointer"]);
    e.GetCameraUp = s => {
        const o = new e.Vector3;
        return un(o._address, s._address), o
    };
    const cn = a.cwrap("GetCameraRight", "void", ["pointer", "pointer"]);
    e.GetCameraRight = s => {
        const o = new e.Vector3;
        return cn(o._address, s._address), o
    };
    const En = a.cwrap("CameraMoveForward", "pointer", ["pointer", "number", "boolean"]);
    e.CameraMoveForward = (s, o, l) => En(s._address, o, l);
    const mn = a.cwrap("CameraMoveUp", "pointer", ["pointer", "number"]);
    e.CameraMoveUp = (s, o) => mn(s._address, o);
    const pn = a.cwrap("CameraMoveRight", "pointer", ["pointer", "number", "boolean"]);
    e.CameraMoveRight = (s, o, l) => pn(s._address, o, l);
    const Mn = a.cwrap("CameraMoveToTarget", "pointer", ["pointer", "number"]);
    e.CameraMoveToTarget = (s, o) => Mn(s._address, o);
    const Sn = a.cwrap("CameraYaw", "pointer", ["pointer", "number", "boolean"]);
    e.CameraYaw = (s, o, l) => Sn(s._address, o, l);
    const Cn = a.cwrap("CameraPitch", "pointer", ["pointer", "number", "boolean", "boolean", "boolean"]);
    e.CameraPitch = (s, o, l, d, E) => Cn(s._address, o, l, d, E);
    const Rn = a.cwrap("CameraRoll", "pointer", ["pointer", "number"]);
    e.CameraRoll = (s, o) => Rn(s._address, o);
    const Ln = a.cwrap("GetCameraViewMatrix", "void", ["pointer", "pointer"]);
    e.GetCameraViewMatrix = s => {
        const o = new e.Matrix;
        return Ln(o._address, s._address), o
    };
    const In = a.cwrap("GetCameraProjectionMatrix", "void", ["pointer", "pointer", "number"]);
    e.GetCameraProjectionMatrix = (s, o) => {
        const l = new e.Matrix;
        return In(l._address, s._address, o), l
    };
    const Tn = a.cwrap("DrawTextBoxed", "pointer", ["pointer", "string", "pointer", "number", "number", "boolean", "pointer"]);
    e.DrawTextBoxed = (s, o, l, d, E, p, b) => Tn(s._address, o, l._address, d, E, p, b._address);
    const bn = a.cwrap("DrawTextBoxedSelectable", "pointer", ["pointer", "string", "pointer", "number", "number", "boolean", "pointer", "number", "number", "pointer", "pointer"]);
    if (e.DrawTextBoxedSelectable = (s, o, l, d, E, p, b, x, P, An, wn) => bn(s._address, o, l._address, d, E, p, b._address, x, P, An._address, wn._address), e.UniformFloat = class {
            constructor(o, l, d) {
                this._shader = o, this._size = 4, this._address = d || a._malloc(this._size), this._loc = e.GetShaderLocation(o, l)
            }
            get value() {
                return a.HEAPF32[this._address / 4]
            }
            set value(o) {
                a.HEAPF32[this._address / 4] = o, e.SetShaderValue(this._shader, this._loc, this, e.SHADER_UNIFORM_FLOAT)
            }
        }, e.UniformVector2 = class {
            constructor(o, l, d) {
                this._shader = o, this._val = new e.Vector2({}, d), this._loc = e.GetShaderLocation(o, l)
            }
            get x() {
                return this._val.x
            }
            set x(o) {
                this._val.x = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC2)
            }
            get y() {
                return this._val.y
            }
            set y(o) {
                this._val.y = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC2)
            }
        }, e.UniformVector3 = class {
            constructor(o, l, d) {
                this._shader = o, this._val = new e.Vector3({}, d), this._loc = e.GetShaderLocation(o, l)
            }
            get x() {
                return this._val.x
            }
            set x(o) {
                this._val.x = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC3)
            }
            get y() {
                return this._val.y
            }
            set y(o) {
                this._val.y = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC3)
            }
            get z() {
                return this._val.z
            }
            set y(o) {
                this._val.z = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC3)
            }
        }, e.UniformVector4 = class {
            constructor(o, l, d) {
                this._shader = o, this._val = new e.Vector4({}, d), this._loc = e.GetShaderLocation(o, l)
            }
            get x() {
                return this._val.x
            }
            set x(o) {
                this._val.x = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get y() {
                return this._val.y
            }
            set y(o) {
                this._val.y = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get z() {
                return this._val.z
            }
            set y(o) {
                this._val.z = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get w() {
                return this._val.w
            }
            set w(o) {
                this._val.w = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
        }, e.UniformColor = class {
            constructor(o, l, d) {
                this._shader = o, this._val = new e.Vector4({}, d), this._loc = e.GetShaderLocation(o, l)
            }
            get r() {
                return this._val.x
            }
            set r(o) {
                this._val.x = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get g() {
                return this._val.y
            }
            set g(o) {
                this._val.y = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get b() {
                return this._val.z
            }
            set b(o) {
                this._val.z = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
            get a() {
                return this._val.w
            }
            set a(o) {
                this._val.w = o, e.SetShaderValue(this._shader, this._loc, this._val, e.SHADER_UNIFORM_VEC4)
            }
        }, e.UniformInt = class {
            constructor(o, l, d) {
                this._shader = o, this._size = 4, this._address = d || a._malloc(this._size), this._loc = e.GetShaderLocation(o, l)
            }
            get value() {
                return a.HEAP32[this._address / 4]
            }
            set value(o) {
                a.HEAP32[this._address / 4] = o, e.SetShaderValue(this._shader, this._loc, this, e.SHADER_UNIFORM_INT)
            }
        }, e.addFile = async (s, o) => {
            o || (o = s);
            const l = o.split("/").slice(0, -1);
            let d = "";
            for (const E of l) {
                d = d + "/" + E;
                try {
                    a.FS.mkdir(d)
                } catch {}
            }
            a.FS.writeFile(o, new Uint8Array(await fetch(s).then(E => E.arrayBuffer())))
        }, e.free = s => s._address ? a._free(s._address) : a._free(s), e.globalize = () => {
            for (const s of Object.keys(e)) window[s] = e[s]
        }, t && await t(e), n) {
        const s = o => {
            n(o, e), requestAnimationFrame(s)
        };
        s()
    }
    return e
}

function raylib_run_string(r, t) {
    new Function(["runGame", "canvas"], t + `

    if (typeof InitGame === 'undefined') {
      console.error('Make sure to add InitGame() to your raylib-game.')
      return
    }
    if (typeof UpdateGame === 'undefined') {
      console.error('Make sure to add UpdateGame() to your raylib-game.')
      return
    }

    let CHUNK3HERE

    runGame(canvas, async raylib => {CHUNK2HERE

      await InitGame(raylib)
    }, UpdateGame)
  `)(raylib_run, r)
}