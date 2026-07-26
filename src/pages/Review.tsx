import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import { ReviewManager } from "../framework/application";
import { StorageService } from "../services/StorageService";

const reviewManager=new ReviewManager();

export default function Review(){
 const navigate=useNavigate();
 const session=StorageService.loadInterview();

 if(!session){
   return <div><AppHeader/><main><h2>No Interview Session</h2></main></div>;
 }

 const framework=session.getFramework();
 const validation=useMemo(()=>reviewManager.validate(session),[session]);

 return (
  <div className="conversation-page">
   <AppHeader/>
   <main className="conversation-content">
    <div className="conversation-card">
      <InterviewHeader systemName={framework.metadata.systemName} capability={framework.metadata.capability}/>
      <InterviewProgress current={session.getCurrentSectionIndex()+1} total={session.getTotalSections()}/>
      <p>{validation.valid?"Ready for export":"Validation issues found."}</p>
    </div>
   </main>
   <AppFooter onBack={()=>navigate(-1)}
    secondaryText="Back"
    onSecondary={()=>navigate(-1)}
    primaryText="Export"
    onPrimary={()=>reviewManager.exportMarkdown(session)}
    primaryDisabled={!validation.valid}/>
  </div>);
}
