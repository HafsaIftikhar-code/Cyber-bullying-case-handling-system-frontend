import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        CaseManager manager = new CaseManager();

        System.out.println("1. File Report");
        System.out.println("2. Track Case");
        System.out.print("Choose option: ");
        int choice = sc.nextInt();
        sc.nextLine(); // consume newline

        if (choice == 1) {
            System.out.print("Enter Name: ");
            String name = sc.nextLine();

            System.out.print("Enter Platform: ");
            String platform = sc.nextLine();

            System.out.print("Enter Severity (Low/Medium/High): ");
            String severity = sc.nextLine();

            System.out.print("Enter Description: ");
            String description = sc.nextLine();

            String caseId = manager.fileReport(
                    name, platform, severity, description
            );

            System.out.println("Case Submitted Successfully");
            System.out.println("Your Case ID is: " + caseId);
        }

        else if (choice == 2) {
            System.out.print("Enter Case ID: ");
            String caseId = sc.nextLine();

            CyberCase c = manager.trackCase(caseId);

            if (c != null) {
                System.out.println("Case Found");
                System.out.println("Name: " + c.name);
                System.out.println("Platform: " + c.platform);
                System.out.println("Severity: " + c.severity);
                System.out.println("Status: " + c.status);
            } else {
                System.out.println("Case Not Found");
            }
        }

        sc.close();
    }
}
