
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";

const teams = [
  ["Manchester United","https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",7,3,2,1,0,13,2],
  ["FC Barcelona","https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",7,3,2,1,0,11,5],
  ["AC Milan","https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",7,3,2,1,0,9,4],
  ["Tottenham","https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",7,3,2,1,0,6,1],
  ["Bayer Leverkusen","https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",7,3,2,1,0,9,6],
  ["Sevilla","https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",7,3,2,1,0,8,6],
  ["Athletic Bilbao","https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg",6,3,2,0,1,8,5],
  ["Manchester City","https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",6,3,2,0,1,10,9],
  ["Real Madrid","https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",6,3,2,0,1,6,6],
  ["PSG","https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",5,3,1,2,0,11,5],
  ["Brighton","https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg",4,2,1,1,0,4,1],

["Napoli","https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg",4,3,1,1,1,5,5],

["Inter Milan","https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",4,3,1,1,1,6,7],

["Liverpool","https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",1,3,0,1,2,7,10],

["Benfica","https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",1,3,0,1,2,4,11],

["Dortmund","https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",1,3,0,1,2,2,10],

["Chelsea","https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",0,3,0,0,3,3,8],

["Arsenal","https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",0,2,0,0,2,3,9],

["Everton","https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",0,3,0,0,3,1,8],

["Fulham","https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg",0,3,0,0,3,1,9],
];

export default function Home() {

  const [selectedTeam, setSelectedTeam] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [logged, setLogged] = useState(false);

  const [enemy, setEnemy] = useState("");
  const [myGoal, setMyGoal] = useState("");
  const [enemyGoal, setEnemyGoal] = useState("");

  const [matches, setMatches] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {

    const saved = localStorage.getItem("zico_team");

    if(saved){
      setSelectedTeam(saved);
      setLogged(true);
    }

    const unsub = onSnapshot(
      collection(db,"matches"),
      (snap)=>{

        const arr:any[] = [];

        snap.forEach((d)=>{
          arr.push(d.data());
        });

        setMatches(arr);

      }
    );

    return ()=>unsub();

  },[]);

  useEffect(()=>{

  const interval = setInterval(()=>{

    const now = new Date();

    const end = new Date();

    end.setHours(23);
    end.setMinutes(59);  
    end.setSeconds(0);

    const diff = end.getTime() - now.getTime();

    if(diff <= 0){

      setTimeLeft("Hisob yozish vaqti tugadi");

      return;

    }

    const h =
    Math.floor(diff / 1000 / 60 / 60);

    const m =
    Math.floor((diff / 1000 / 60) % 60);

    const s =
    Math.floor((diff / 1000) % 60);

    setTimeLeft(`${h}h ${m}m ${s}s`);

  },1000);

  return ()=>clearInterval(interval);

},[]);

  async function submitMatch(){

    const hour = new Date().getHours();

if(hour < 17 || hour >= 18){

  alert("Hisob yozish vaqti tugagan");

  return;

}

    if(!enemy || !myGoal || !enemyGoal) return;

    await addDoc(collection(db,"matches"),{
      team1:selectedTeam,
      team2:enemy,
      goal1:Number(myGoal),
      goal2:Number(enemyGoal),
      created:Date.now()
    });

    setEnemy("");
    setMyGoal("");
    setEnemyGoal("");

  }

  function login(){

    if(!selectedTeam) return;

    localStorage.setItem("zico_team", selectedTeam);

    setLogged(true);

  }

  function logout(){

    localStorage.removeItem("zico_team");

    location.reload();

  }

  const liveTeams = useMemo(()=>{

    const updated = teams.map((t:any)=>({

      name:t[0],
      logo:t[1],
      pts:t[2],
      p:t[3],
      w:t[4],
      d:t[5],
      l:t[6],
      gf:t[7],
      ga:t[8],

    }));

    matches.forEach((m)=>{

      const a:any = updated.find((x)=>x.name===m.team1);
      const b:any = updated.find((x)=>x.name===m.team2);

      if(!a || !b) return;

      a.gf += m.goal1;
      a.ga += m.goal2;

      b.gf += m.goal2;
      b.ga += m.goal1;

      a.p += 1;
      b.p += 1;

      if(m.goal1 > m.goal2){

        a.w += 1;
        b.l += 1;

        a.pts += 3;

      }

      else if(m.goal2 > m.goal1){

        b.w += 1;
        a.l += 1;

        b.pts += 3;

      }

      else{

        a.d += 1;
        b.d += 1;

        a.pts += 1;
        b.pts += 1;

      }

    });

    return updated.sort((a,b)=>{

      if(b.pts !== a.pts){
        return b.pts - a.pts;
      }

      return (b.gf - b.ga) - (a.gf - a.ga);

    });

  },[matches]);

  const currentTeam = liveTeams.find(
    (t:any)=>t.name===selectedTeam
  );

  return (

    <div
      style={{
        minHeight:"100vh",
        background:"linear-gradient(to bottom,#050505,#111111)",
        color:"white",
        padding:"20px",
        fontFamily:"sans-serif",
      }}
    >

      <div
        style={{
          maxWidth:"1450px",
          margin:"0 auto",
        }}
      >

        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            flexWrap:"wrap",
            gap:"20px",
            marginBottom:"30px",
          }}
        >

          <div>

            <div
              style={{
                display:"flex",
                alignItems:"center",
                gap:"16px",
              }}
            >

              <img
                src="/zico-logo.webp"
                style={{
                  width:"90px",
                  height:"90px",
                  objectFit:"contain",
                }}
              />

              <div>

                <h1
                  style={{
                    fontSize:"52px",
                    fontWeight:"900",
                    margin:0,
                  }}
                >
                  Zico Liga 
                </h1>

                <p
                  style={{
                    color:"#999",
                    marginTop:"5px",
                  }}
                >
                  1 Sezon: 02.05.2026 — 02.06.2026
                  <div
  style={{
    marginTop:"10px",
    color:"#22c55e",
    fontWeight:"900",
    fontSize:"18px",
    textShadow:"0 0 10px rgba(34,197,94,0.8)",
  }}
>
  ⏰ Match Time: {timeLeft}
</div>
                </p>

              </div>

            </div>

          </div>

          {!logged ? (

            <div
              style={{
                display:"flex",
                gap:"12px",
              }}
            >

              <select
                value={selectedTeam}
                onChange={(e)=>setSelectedTeam(e.target.value)}
                style={input}
              >

                <option value="">
                  Jamoa tanlang
                </option>

                {teams.map((t:any)=>(

                  <option key={t[0]}>
                    {t[0]}
                  </option>

                ))}

              </select>

              <button
                onClick={login}
                style={pinkBtn}
              >
                Kirish
              </button>

            </div>

          ) : (

            <div
              style={{
                display:"flex",
                gap:"12px",
                flexWrap:"wrap",
              }}
            >

              <button
                onClick={()=>setShowProfile(true)}
                style={darkBtn}
              >
                Profile
              </button>

              <select
                value={enemy}
                onChange={(e)=>setEnemy(e.target.value)}
                style={input}
              >

                <option value="">
                  Raqib
                </option>

                {teams
                .filter((t:any)=>t[0] !== selectedTeam)
                .map((t:any)=>(

                  <option key={t[0]}>
                    {t[0]}
                  </option>

                ))}

              </select>

              <input
                value={myGoal}
                onChange={(e)=>setMyGoal(e.target.value)}
                placeholder="Siz"
                style={smallInput}
              />

              <input
                value={enemyGoal}
                onChange={(e)=>setEnemyGoal(e.target.value)}
                placeholder="Raqib"
                style={smallInput}
              />

              <button
                onClick={submitMatch}
                style={pinkBtn}
              >
                Tasdiqlash
              </button>

              <button
                onClick={logout}
                style={darkBtn}
              >
                Chiqish
              </button>

            </div>

          )}

        </div>

        <div
          style={{
            overflowX:"auto",
            borderRadius:"24px",
            border:"1px solid #1f1f1f",
            background:"#0a0a0a",
          }}
        >

          <table
            style={{
              width:"100%",
              borderCollapse:"collapse",
            }}
          >

            <thead>
              <tr
                style={{
                  background:"#111",
                  color:"#999",
                  height:"70px",
                }}
              >
                <th>#</th>
                <th align="left">Club</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>Dif</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>

              {liveTeams.map((t:any,index)=>{

                const dif = t.gf - t.ga;

                return(

                  <tr
                    key={t.name}
                    style={{
                      background:
index >= 17
? "linear-gradient(to right,#650000,#8b0000)"
: index <= 3
? "#101820"
: "#0b0b0b",
                      borderBottom:"1px solid #151515",
                      height:"82px",
                    }}
                  >

                    <td align="center">
                      {index + 1}
                    </td>

                    <td>

                      <div
                        style={{
                          display:"flex",
                          alignItems:"center",
                          gap:"14px",
                        }}
                      >

                        <div
                          style={{
                            width:"68px",
                            height:"68px",
                            minWidth:"68px",
                            borderRadius:"50%",
                            background:"#ffd400",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            boxShadow:"0 0 15px rgba(255,214,0,0.7)",
                          }}
                        >

                          <img
                            src={t.logo}
                            style={{
                              width:"46px",
                              height:"46px",
                              objectFit:"contain",
                            }}
                          />

                        </div>

                        <div>

                          <div
                            style={{
                              fontWeight:"700",
                              fontSize:"18px",
                            }}
                          >
                            {t.name}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td align="center">{t.p}</td>
                    <td align="center">{t.w}</td>
                    <td align="center">{t.d}</td>
                    <td align="center">{t.l}</td>
                    <td align="center">{t.gf}</td>
                    <td align="center">{t.ga}</td>

                    <td align="center">
                      {dif}
                    </td>

                    <td align="center">
                      {t.pts}
                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

        {showProfile && currentTeam && (

          <div
            style={{
              position:"fixed",
              inset:0,
              background:"rgba(0,0,0,0.8)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              zIndex:999,
            }}
          >

            <div
              style={{
                width:"380px",
                background:"#101826",
                borderRadius:"30px",
                padding:"30px",
              }}
            >

              <img
                src={currentTeam.logo}
                style={{
                  width:"100px",
                  height:"100px",
                  objectFit:"contain",
                }}
              />

              <h1>
                {currentTeam.name}
              </h1>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>

                <div style={card}>
                  <h3>Wins</h3>
                  <h1>{currentTeam.w}</h1>
                </div>

                <div style={card}>
                  <h3>Draws</h3>
                  <h1>{currentTeam.d}</h1>
                </div>

                <div style={card}>
                  <h3>Lose</h3>
                  <h1>{currentTeam.l}</h1>
                </div>

                <div style={card}>
                  <h3>Points</h3>
                  <h1>{currentTeam.pts}</h1>
                </div>

              </div>

              <button
                onClick={()=>setShowProfile(false)}
                style={{
                  marginTop:"20px",
                  width:"100%",
                  background:"#ff2f92",
                  border:"none",
                  color:"white",
                  padding:"14px",
                  borderRadius:"16px",
                  cursor:"pointer",
                }}
              >
                Close
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

const input:any = {
  background:"#111",
  border:"1px solid #262626",
  color:"white",
  padding:"14px",
  borderRadius:"14px",
  minWidth:"220px",
  outline:"none",
};

const smallInput:any = {
  background:"#111",
  border:"1px solid #262626",
  color:"white",
  padding:"14px",
  borderRadius:"14px",
  width:"90px",
  outline:"none",
};

const pinkBtn:any = {
  background:"linear-gradient(to right,#ff2f92,#ff4db2)",
  border:"none",
  color:"white",
  padding:"14px 24px",
  borderRadius:"14px",
  cursor:"pointer",
  fontWeight:"bold",
};

const darkBtn:any = {
  background:"#1a1a1a",
  border:"1px solid #333",
  color:"white",
  padding:"14px 24px",
  borderRadius:"14px",
  cursor:"pointer",
  fontWeight:"bold",
};

const card:any = {
  background:"#192233",
  borderRadius:"18px",
  padding:"20px",
  textAlign:"center",
};
