public class CyberCase {

    String caseId;
    String name;
    String platform;
    String severity;
    String description;
    String status;

    public CyberCase(String caseId, String name, String platform,
                      String severity, String description) {
        this.caseId = caseId;
        this.name = name;
        this.platform = platform;
        this.severity = severity;
        this.description = description;
        this.status = "Submitted"; // default status
    }
}
