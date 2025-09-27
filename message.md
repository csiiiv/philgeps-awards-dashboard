# PhilGEPS Dashboard - Government Procurement Analytics

Hey everyone! 👋

I wanted to share something I've been working on - the **PhilGEPS Dashboard**. It's a tool for exploring Philippine government procurement data, and I built it because I think government spending should be more transparent and accessible to everyone.

## What it does

The dashboard lets you dig into government contracts in two main ways:

**Data Explorer** - This is the main interface where you can explore data by different entities (contractors, government agencies, areas, business categories). You can see who's getting the most contracts, which areas are spending the most, stuff like that. It's pretty interactive - you can click on things to drill down and see more details.

**Advanced Search** - This is for when you want to find specific contracts. You can search by keywords, filter by date ranges, contractors, etc. It's more like a traditional search interface.

The data covers about 2.2 million contract records from 2013-2021, plus some additional flood control data from 2022-2025. So there's a lot to explore.

## Try it out

You can check it out right now:
- Dashboard: https://philgeps.simple-systems.dev/
- API: https://philgeps-api.simple-systems.dev/

Or if you want to run it locally:
```bash
./setup_env.sh
./run_local.sh
```

## A bit about me

So actually just started really learning about web development j 1-2 months ago. This is basically my first real project, and I focused mainly on getting the functionality working rather than worrying too much about architecture or scalability patterns.

I think the dashboard works well for what it does, but I'm sure there are plenty of things that could be improved from a technical standpoint. I'd love to hear from more experienced developers about what I could do better, or if there are obvious architectural improvements I should consider.

I'm still learning a lot, and this project was a great way to dive into React, Django, and all the other stuff that goes into building something like this.

## The tech stuff

- Frontend: React 19, TypeScript, Styled Components
- Backend: Django 4.2 with SQLite and DuckDB
- Data: Parquet files for the heavy lifting (DuckDB was originally used as this started as a personal web dashboard project. Mostly to channel frustration about the current shitshow that is our government. Should probably migrate this to postgres?)
- Charts: Chart.js and Recharts for visualizations

## Who might find this useful

- Citizens who want to see where their tax money is going
- Journalists doing investigative work
- Researchers studying government procurement
- Government officials who need to analyze contract award patterns
- Anyone curious about how government contracts are distributed

## Feedback welcome

I'd really appreciate any feedback you have! Whether you're:
- A developer who sees something that could be improved
- A user who has ideas for new features
- Someone who just wants to chat about government transparency
- Another beginner who wants to compare notes

Feel free to open issues, submit PRs, or just reach out. I'm still learning and would love to hear from you!

## Documentation

If you want to dig deeper:
- [User Guide](docs/DASHBOARD_DOCUMENTATION.md)
- [API Docs](docs/ACTIVE_API_DOCUMENTATION.md)
- [Setup Guide](GITHUB_SETUP.md)

Thanks for checking it out! Let me know what you think.

---

*Built with ❤️ for transparent government procurement*