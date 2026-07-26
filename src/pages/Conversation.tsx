import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import InterviewInput from "../components/InterviewInput";
import { InterviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import { StorageService } from "../services/StorageService";
import "../styles/conversation.css";
import "../styles/conversation-layout.css";

const interviewManager = new InterviewManager();

export default function Conversation() {
  const location = useLocation();
  const navigate = useNavigate();
  const system = location.state?.system;
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [, refresh] = useState(0);

  useEffect(() => {
    if (!system) { setLoadingError("No Framework System selected."); return; }
    try { setSession(interviewManager.create(system.id)); }
    catch (e) { setLoadingError(e instanceof Error ? e.message : "Failed to load Framework."); }
  }, [system]);

  const redraw = ()=>refresh(v=>v+1);

  function nextSection() {
    if (!session) return;
    if (session.isLastSection()) {
      StorageService.saveInterview(session);
      navigate("/review");
      return;
    }
    session.nextSection();
    redraw();
  }

  if (loadingError) return <div>{loadingError}</div>;
  if (!session) return <div>Loading...</div>;

  const framework=session.getFramework();
  const current=session.getCurrentSection();

  return (
    <div className="conversation-page">
      <AppHeader/>
      <main className="conversation-content">
        <div className="conversation-card">
          <InterviewHeader systemName={framework.metadata.systemName} capability={framework.metadata.capability}/>
          <InterviewProgress current={session.getCurrentSectionIndex()+1} total={session.getTotalSections()}/>
          <InterviewSection section={current}/>
          <InterviewInput value={session.getCurrentResponse()} onChange={(v)=>{session.saveCurrentResponse(v);redraw();}}/>
        </div>
      </main>
      <AppFooter onBack={()=>navigate(-1)}
        secondaryText="Previous"
        onSecondary={()=>{if(session.previousSection())redraw();}}
        secondaryDisabled={session.isFirstSection()}
        primaryText={session.isLastSection()?"Finish":"Next"}
        onPrimary={nextSection}/>
    </div>
  );
}
