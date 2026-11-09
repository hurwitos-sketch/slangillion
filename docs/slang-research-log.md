# Slang rebalance: source research log

Research date: 2026-11-09. This log distinguishes retrieved material from candidate sources that could not be accessed. It is not a claim that all entries have been verified online.

## Access limitation

A request to https://en.wiktionary.org/wiki/dawg failed in the default execution sandbox because it could not reach the configured proxy. Retrying outside that sandbox with inherited proxy and TLS verification returned **HTTP 403 Forbidden / CONNECT tunnel failed** from the environment proxy. The running HTTP policy was restricted and enforced, with no custom dictionary hosts.

A saved environment draft adds these research destinations while retaining the package-manager preset: en.wiktionary.org, www.merriam-webster.com, www.dictionary.com, www.collinsdictionary.com, dictionary.cambridge.org, greensdictofslang.com, www.urbandictionary.com, knowyourmeme.com, www.google.com. The draft save requires review/save and publication in environment settings. It does not prove runtime access changed. Full dictionary and web-search review remains blocked pending that change.

## Online sources actually inspected

### Community dictionary with explicit definitions

https://github.com/dinoducktank/slang_dictionary/blob/main/dictionary.py

Retrieved from its public raw GitHub URL. The small dictionary provides these short meanings:

- BRO: “my very good friend”.
- LOL: “laughing out loud”.
- CRINGE: “something very uncomfortable”.
- PEAK: “something deemed very good”.

The four corresponding entries are marked `community-definition-checked` and linked to this source. A small community repository is secondary evidence, not a peer-reviewed or professionally edited dictionary. In particular, CRINGE's discomfort definition supports the intended embarrassment context but does not establish every possible use of the word.

### Sources inspected but not used as meaning verification

- https://github.com/tumhi4/internet-slang-dictionary/blob/main/gen-z-slang.md — short list linking to a separate slang site; no substantive definitions in the retrieved file. Links were not treated as retrieved definitions.
- https://github.com/Obad0x/genz-dictionary/blob/main/routes/slangRoutes.js — frontend routes using generated definitions; excluded as linguistic evidence.
- https://github.com/code-kp/slangsync/blob/master/script.js — interface relying on an external Urban Dictionary API; the interface alone does not verify terms.
- https://github.com/mattbierner/urban-dictionary-word-list — README describes an April 2022 snapshot of entry names. A sample of `data/D.data` contains names only, including noise; appearance in this list is not meaning verification.
- https://github.com/Favour-create-bit/bizzyPedia-Dictionary/blob/main/script.js — narrow Nigerian music-culture vocabulary; not used as evidence for unrelated US/UK money or friendship senses.
- https://github.com/MakariSW/slangtionary and https://github.com/Murat-Sahin1/Know-Your-Slang — repository structures inspected; no definition-bearing source was retrieved for the current terms.

Repository searches were genuine requests to github.com/search. No blocked dictionary was accessed through a proxy or a rewritten host.

## Current editorial treatment

All other entries are explicitly marked `pending-web-review`. Their meanings and point tiers are editorial selections, not a claim of completed internet verification. User-requested context-dependent inclusions are annotated, notably:

- **jit**: regional address for a younger person/acquaintance, not inherently a close friend.
- **motion**: requested financial activity/income/hustle usage, not a literal currency denomination.
- **talent**: British informal collective reference to attractive people, not ordinary ability.
- **fine shit**: explicit appearance slang supplied by the user; spelling aliases share one score.
- **guy/fella**: familiar friendly address, included by request rather than presented as universal friendship synonyms.

The pending audit must check these senses, regional contexts, and remaining entries against actual definition-bearing sources before the research work can be described as complete. The game uses only curated deterministic matching; no live AI or external API judges answers.
