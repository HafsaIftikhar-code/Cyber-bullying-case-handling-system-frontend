import java.util.HashMap;

public class CaseManager {

    HashMap<String, CyberCase> cases = new HashMap<>();
    int counter = 1;

    // FILE REPORT
    public String fileReport(String name, String platform,
                             String severity, String description) {

        String caseId = "CASE-" + counter;
        counter++;

        CyberCase newCase = new CyberCase(
                caseId, name, platform, severity, description
        );

        cases.put(caseId, newCase);

        return caseId; // user ko yahi ID milegi
    }

    // TRACK CASE
    public CyberCase trackCase(String caseId) {
        return cases.get(caseId);
    }
}
